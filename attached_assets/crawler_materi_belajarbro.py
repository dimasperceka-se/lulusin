"""
═══════════════════════════════════════════════════════════════════════════════
  CRAWLER MATERI SKD CPNS - BELAJARBRO.ID
═══════════════════════════════════════════════════════════════════════════════

Fungsi: Mengambil semua rangkuman materi dari belajarbro.id dan menyimpan
        sebagai file Markdown (.md), 1 file per materi.

Sumber:
  - https://belajarbro.id/cpns/materi-online   (Umum: 2 artikel tambahan)
  - https://belajarbro.id/cpns/materi-twk-skd  (TWK: ~43 materi)
  - https://belajarbro.id/cpns/materi-tiu-skd  (TIU: ~15 materi)
  - https://belajarbro.id/cpns/materi-tkp-skd  (TKP: ~26 materi)

CARA PAKAI:
  1. Install dependencies:
       pip install requests beautifulsoup4 markdownify lxml

  2. Jalankan script:
       python crawler_materi_belajarbro.py

  3. Tunggu hingga selesai (~10-15 menit untuk 80+ materi).
     Hasil: folder materi_belajarbro/ berisi struktur:
       materi_belajarbro/
         ├── INDEX.md          ← daftar isi seluruh materi
         ├── Umum/
         │   ├── Passing-Grade-SKD.md
         │   └── Kisi-Kisi-SKD.md
         ├── TWK/
         │   ├── 01-Nasionalisme.md
         │   ├── 02-Integritas.md
         │   ├── 03-Bela-Negara.md
         │   ├── 04-Pilar-Negara.md
         │   ├── 05-Pancasila.md
         │   └── ...
         ├── TIU/
         │   ├── 01-Analogi-Kata.md
         │   └── ...
         └── TKP/
             └── ...

KEUNGGULAN FORMAT MARKDOWN:
  - Struktur asli (heading, bullet, tabel, bold) DIPERTAHANKAN
  - Bisa langsung dipakai di Obsidian, VS Code, Typora, GitHub
  - Plain text, ringan, mudah di-search dengan grep
  - Mudah di-convert ke PDF/HTML/Word kalau perlu

ETIKA CRAWLING:
  - Delay 3 detik antar request (sopan ke server)
  - User-Agent jujur (identifikasi sebagai script edukasi pribadi)
  - Cache otomatis: kalau crash, jalankan ulang → tidak download ulang
  - Hasil HANYA untuk belajar pribadi. Konten © Belajarbro.id

═══════════════════════════════════════════════════════════════════════════════
"""

import os
import re
import sys
import time
import hashlib
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md

# ─────────────────────────────────────────────────────────────────────────────
# KONFIGURASI UTAMA
# ─────────────────────────────────────────────────────────────────────────────

BASE_URL = "https://belajarbro.id"
OUTPUT_DIR = Path("materi_belajarbro")
CACHE_DIR = Path("cache_belajarbro_materi")  # cache terpisah dari crawler soal
DELAY_SECONDS = 3

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; PersonalStudyScraper/1.0; "
                  "tujuan: latihan CPNS pribadi)",
    "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
}

# Halaman INDEX per kategori. URL khusus yang ada di "Materi Online" (Umum)
# adalah 2 artikel: Passing Grade & Kisi-Kisi. Sisanya cuma navigator.
INDEX_PAGES = {
    "Umum": f"{BASE_URL}/cpns/materi-online",
    "TWK":  f"{BASE_URL}/cpns/materi-twk-skd",
    "TIU":  f"{BASE_URL}/cpns/materi-tiu-skd",
    "TKP":  f"{BASE_URL}/cpns/materi-tkp-skd",
}

# Pola URL yang dianggap "halaman materi" (artikel konten, bukan navigator)
# Akan dimatch dengan substring di URL.
MATERI_URL_PATTERNS = [
    "/cpns/rangkuman/",           # contoh: /cpns/rangkuman/pancasila
    "/cpns/artikel-twk-",         # contoh: /cpns/artikel-twk-12.php
    "/cpns/artikel-tiu-",         # contoh: /cpns/artikel-tiu-05.php
    "/cpns/artikel.php?judul=",   # contoh: /cpns/artikel.php?judul=himpunan
    "/cpns/artikel-",             # umum (passing grade, dll)
    "/skd/materi-tiu-",           # contoh: /skd/materi-tiu-analogi-kata
]

# URL yang harus DIKECUALIKAN (navigator, bukan materi)
BLACKLIST = [
    "/cpns/materi-online",
    "/cpns/materi-twk-skd",
    "/cpns/materi-tiu-skd",
    "/cpns/materi-tkp-skd",
    "/cpns/kisi-kisi-2024",  # ini halaman index sendiri
    "/cpns/dashboard",
    "/cpns/skb",
    "/cpns/bromax-skd",
]

# ─────────────────────────────────────────────────────────────────────────────
# UTILITAS: CACHING & FETCH
# ─────────────────────────────────────────────────────────────────────────────

CACHE_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)


def fetch_with_cache(url):
    """Fetch dengan cache lokal."""
    cache_key = hashlib.md5(url.encode()).hexdigest()
    cache_file = CACHE_DIR / f"{cache_key}.html"

    if cache_file.exists():
        return cache_file.read_text(encoding="utf-8")

    print(f"  → Download: {url}")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        cache_file.write_text(resp.text, encoding="utf-8")
        time.sleep(DELAY_SECONDS)
        return resp.text
    except Exception as e:
        print(f"  ✗ Gagal fetch {url}: {e}")
        return None


def is_materi_url(url):
    """Cek apakah URL adalah halaman materi (artikel konten)."""
    # Normalisasi: hapus query string dulu untuk cek blacklist
    url_no_query = url.split("?")[0]
    for blocked in BLACKLIST:
        if url_no_query.rstrip("/").endswith(blocked.rstrip("/")):
            return False

    for pattern in MATERI_URL_PATTERNS:
        if pattern in url:
            return True
    return False


def slugify(text, maxlen=80):
    """Buat nama file aman dari teks judul."""
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[-\s]+", "-", text).strip("-")
    return text[:maxlen]


# ─────────────────────────────────────────────────────────────────────────────
# STEP 1: TEMUKAN SEMUA URL MATERI DARI HALAMAN INDEX
# ─────────────────────────────────────────────────────────────────────────────

def temukan_materi_per_kategori():
    """
    Untuk tiap halaman index, ambil semua link materi.
    Return: dict {kategori: [(judul, url), ...]}
    """
    print("\n[STEP 1] Mengambil daftar materi dari halaman index...\n")
    hasil = {}

    for kategori, index_url in INDEX_PAGES.items():
        print(f"  ── Kategori: {kategori} ──")
        html = fetch_with_cache(index_url)
        if not html:
            hasil[kategori] = []
            continue

        soup = BeautifulSoup(html, "lxml")
        # Cari semua link di area konten (di luar menu sidebar)
        # Strategi: fokus ke <table> yang berisi daftar materi
        materi_list = []
        seen_urls = set()

        # Cari semua <a> dalam tabel atau dalam paragraf konten utama
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if href.startswith("/"):
                href = BASE_URL + href
            if not href.startswith(BASE_URL):
                continue
            if not is_materi_url(href):
                continue
            if href in seen_urls:
                continue

            # Cari judul: cek teks link dulu, kalau "Lihat" cari di kolom sebelumnya
            link_text = link.get_text(strip=True)
            if link_text.lower() in ("lihat", "klik", "baca", ""):
                # Cari row tabel-nya, ambil kolom judul
                tr = link.find_parent("tr")
                if tr:
                    cells = tr.find_all(["td", "th"])
                    # Ambil teks dari kolom sebelum kolom link
                    teks_kolom = []
                    for cell in cells:
                        if cell.find("a", href=True):
                            break
                        teks_kolom.append(cell.get_text(" ", strip=True))
                    judul = " ".join(filter(None, teks_kolom)).strip()
                    # Bersihkan nomor di depan (e.g. "1." atau "a.")
                    judul = re.sub(r"^[a-z0-9]+[.)]\s*", "", judul, flags=re.IGNORECASE)
                else:
                    judul = link_text
            else:
                judul = link_text

            if judul:
                materi_list.append((judul, href))
                seen_urls.add(href)

        hasil[kategori] = materi_list
        print(f"    Ditemukan: {len(materi_list)} materi\n")

    return hasil


# ─────────────────────────────────────────────────────────────────────────────
# STEP 2: EKSTRAK & KONVERSI 1 HALAMAN MATERI KE MARKDOWN
# ─────────────────────────────────────────────────────────────────────────────

def ekstrak_konten_materi(html, url):
    """
    Ambil konten utama materi dari HTML, return (judul, markdown_text).
    """
    soup = BeautifulSoup(html, "lxml")

    # Judul: cari <h1> pertama
    h1 = soup.find("h1")
    judul = h1.get_text(strip=True) if h1 else "Materi Belajarbro"

    # Konten utama: hapus elemen navigasi/footer dulu
    # Berdasarkan analisis, konten ada di tengah-tengah halaman
    # Strategi: ambil semua elemen setelah <h1>, sampai bertemu footer
    if not h1:
        return judul, ""

    # Cari container konten (biasanya main, article, atau div setelah h1)
    container = h1.find_parent()
    while container and container.name not in ("main", "article", "body"):
        container = container.parent

    if not container:
        container = soup.body

    # Buang elemen-elemen yang bukan konten utama
    selectors_to_remove = [
        "nav", "footer", "header", "script", "style", "noscript", "iframe",
        ".menu", ".sidebar", ".navigation", ".breadcrumb", ".comments",
        ".social", ".share", ".related", ".widget", ".ad", ".advertisement",
    ]
    for selector in selectors_to_remove:
        for tag in container.select(selector):
            tag.decompose()

    # Buang link "Daftar" / "Login" / menu sidebar (heuristik)
    for a in container.find_all("a", href=True):
        href = a["href"]
        teks = a.get_text(strip=True)
        if (any(x in href for x in ["/daftar", "/login", "/dashboard"])
                or teks in ("Menu", "Modul", "Home", "SBMPTN", "CPNS", "SKD",
                            "SNBT", "Daftar", "Login", "PPPK", "SKB", "Tryout",
                            "Bromax (Tanpa Iklan)", "Materi Online",
                            "Soal & Pembahasan", "Soal HOTS")):
            a.decompose()

    # Buang list yang isinya cuma menu (terdeteksi punya banyak link nav)
    for ul in container.find_all(["ul", "ol"]):
        items = ul.find_all("li", recursive=False)
        if not items:
            continue
        # Hitung berapa item yang isinya link menu
        nav_count = sum(
            1 for li in items
            if li.find("a") and any(
                k in li.get_text(strip=True).lower()
                for k in ["dashboard", "tryout", "kisi-kisi", "bromax",
                          "materi online", "soal &", "soal hots",
                          "analogi kata new", "silogisme new"]
            )
        )
        if nav_count >= 2:
            ul.decompose()

    # Hapus kategori box di bawah
    for tag in container.find_all(text=re.compile(r"^Kategori\s*$")):
        parent = tag.find_parent()
        if parent:
            # Hapus parent dan beberapa siblings setelahnya
            next_siblings = list(parent.find_next_siblings())
            parent.decompose()
            for sib in next_siblings[:10]:
                try:
                    sib.decompose()
                except Exception:
                    pass

    # Convert ke Markdown
    raw_md = md(
        str(container),
        heading_style="ATX",
        bullets="-",
        strip=["script", "style"],
    )

    # Bersihkan output Markdown
    raw_md = re.sub(r"\n{3,}", "\n\n", raw_md)  # collapse newlines
    raw_md = re.sub(r"[ \t]+\n", "\n", raw_md)  # trailing spaces
    raw_md = raw_md.strip()

    # Hapus boilerplate yang masih nyangkut di akhir (footer)
    boilerplate_markers = [
        "Berbagi itu indah",
        "Belum ada di",
        "Dibuat dengan",
        "Belajar bukan tentang siapa",
        "Belajarbro\n",
    ]
    for marker in boilerplate_markers:
        idx = raw_md.find(marker)
        if idx > 0:
            raw_md = raw_md[:idx].rstrip()

    return judul, raw_md


def buat_markdown_materi(judul_index, url, kategori, urutan):
    """Fetch URL, parse, simpan sebagai file Markdown."""
    html = fetch_with_cache(url)
    if not html:
        return None

    judul_h1, konten_md = ekstrak_konten_materi(html, url)
    judul = judul_index or judul_h1

    if not konten_md or len(konten_md) < 100:
        print(f"    ⚠ Konten kosong/terlalu pendek, skip: {judul}")
        return None

    # Build markdown final
    md_final = f"""# {judul}

{konten_md}

---

*Materi © Belajarbro.id — hanya untuk belajar pribadi.*
"""

    # Buat nama file
    nomor = f"{urutan:02d}"
    nama_file = f"{nomor}-{slugify(judul)}.md"
    folder = OUTPUT_DIR / kategori
    folder.mkdir(exist_ok=True)
    file_path = folder / nama_file

    file_path.write_text(md_final, encoding="utf-8")
    return file_path


# ─────────────────────────────────────────────────────────────────────────────
# STEP 3: BUAT INDEX.md (DAFTAR ISI)
# ─────────────────────────────────────────────────────────────────────────────

def buat_index(hasil_per_kategori, files_per_kategori):
    """Buat file INDEX.md sebagai daftar isi seluruh materi."""
    lines = [
        "# 📚 Materi SKD CPNS - Belajarbro.id",
        "",
        f"> Daftar isi materi yang telah di-download pada {time.strftime('%d %B %Y, %H:%M')}.  ",
        "> Sumber: belajarbro.id — hanya untuk belajar pribadi.",
        "",
        "## Ringkasan",
        "",
        "| Kategori | Jumlah materi |",
        "| --- | --- |",
    ]
    total = 0
    for kategori in INDEX_PAGES:
        n = len(files_per_kategori.get(kategori, []))
        lines.append(f"| {kategori} | {n} |")
        total += n
    lines.append(f"| **TOTAL** | **{total}** |")
    lines.append("")

    for kategori in INDEX_PAGES:
        files = files_per_kategori.get(kategori, [])
        if not files:
            continue
        lines.append(f"## {kategori}")
        lines.append("")
        for judul, rel_path in files:
            lines.append(f"- [{judul}]({rel_path})")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("*Generated by crawler_materi_belajarbro.py*")

    index_path = OUTPUT_DIR / "INDEX.md"
    index_path.write_text("\n".join(lines), encoding="utf-8")
    return index_path


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("═" * 75)
    print("  CRAWLER MATERI SKD CPNS - BELAJARBRO.ID")
    print("  Output: Markdown (.md)")
    print("═" * 75)
    print(f"  Output folder : {OUTPUT_DIR}/")
    print(f"  Cache folder  : {CACHE_DIR}/")
    print(f"  Delay         : {DELAY_SECONDS} detik antar request")

    # Step 1: temukan semua URL materi
    hasil_per_kategori = temukan_materi_per_kategori()

    total_materi = sum(len(v) for v in hasil_per_kategori.values())
    if total_materi == 0:
        print("✗ Tidak ada materi ditemukan.")
        return

    print(f"\n[STEP 2] Akan download & convert {total_materi} materi.")
    print(f"        Estimasi: {total_materi * DELAY_SECONDS // 60} menit "
          f"{total_materi * DELAY_SECONDS % 60} detik\n")

    files_per_kategori = {}

    for kategori, daftar in hasil_per_kategori.items():
        print(f"\n  ── {kategori} ({len(daftar)} materi) ──")
        files_kategori = []
        for idx, (judul, url) in enumerate(daftar, start=1):
            print(f"    [{idx}/{len(daftar)}] {judul[:60]}")
            file_path = buat_markdown_materi(judul, url, kategori, idx)
            if file_path:
                # Path relatif untuk INDEX.md
                rel_path = file_path.relative_to(OUTPUT_DIR)
                files_kategori.append((judul, str(rel_path).replace(os.sep, "/")))
        files_per_kategori[kategori] = files_kategori
        print(f"  ✓ {kategori}: {len(files_kategori)} materi tersimpan")

    # Step 3: buat INDEX.md
    print("\n[STEP 3] Membuat INDEX.md (daftar isi)...")
    index_path = buat_index(hasil_per_kategori, files_per_kategori)

    # Ringkasan
    total_disimpan = sum(len(v) for v in files_per_kategori.values())
    print("\n" + "═" * 75)
    print("  SELESAI! 🎯")
    print("═" * 75)
    for kategori, files in files_per_kategori.items():
        print(f"  • {kategori}: {len(files)} materi")
    print(f"  • TOTAL: {total_disimpan} file Markdown")
    print(f"\n  Output : {OUTPUT_DIR}/")
    print(f"  Index  : {index_path}")
    print(f"  Cache  : {len(list(CACHE_DIR.glob('*.html')))} halaman tersimpan")
    print("═" * 75)
    print("\n  💡 Tip: buka {0}/INDEX.md di Obsidian atau VS Code".format(OUTPUT_DIR))
    print("     untuk navigasi mudah antar materi.")


if __name__ == "__main__":
    main()
