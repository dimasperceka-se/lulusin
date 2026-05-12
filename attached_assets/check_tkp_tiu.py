from pathlib import Path
import hashlib, re

CACHE = Path(r"c:\Users\dimas\Documents\Other\Lulusin\attached_assets\crawling_result\cache_belajarbro")

urls = [
    "https://belajarbro.id/cpns/skd/tkp/soal-pelayanan-publik-1",
    "https://belajarbro.id/cpns/skd/tiu/soal-analogi-kata-1",
]

for u in urls:
    h = hashlib.md5(u.encode()).hexdigest()
    fp = CACHE / f"{h}.html"
    if not fp.exists():
        print("MISS:", u)
        continue
    html = fp.read_text(encoding="utf-8")
    m1 = re.findall(r"Jawaban\s*:\s*[a-eA-E]", html)
    print(u.split("/")[-1], "→ letter matches:", m1[:6])
    # Try numeric scoring patterns for TKP
    m2 = re.findall(r'class="jawaban[^"]*"[^>]*>\s*([^<]+)<', html)
    if m2:
        print("  jawaban div contents:", m2[:3])
