from pathlib import Path
from bs4 import BeautifulSoup
import re, hashlib

CACHE = Path(r"c:\Users\dimas\Documents\Other\Lulusin\attached_assets\crawling_result\cache_belajarbro")

# Sample of TKP URLs (paket 1-140 for various subcategories)
TKP_SUBCATS = ["pelayanan-publik", "jejaring-kerja", "sosial-budaya", "teknologi-informasi-dan-komunikasi",
               "profesionalisme", "anti-radikalisme"]

total_pages = 0
pages_with_answer = 0
pages_with_5_questions = 0
total_questions = 0
total_answered = 0

for subcat in TKP_SUBCATS:
    for n in range(1, 30):  # paket 1..29 max
        url = f"https://belajarbro.id/cpns/skd/tkp/soal-{subcat}-{n}"
        h = hashlib.md5(url.encode()).hexdigest()
        fp = CACHE / f"{h}.html"
        if not fp.exists():
            continue
        total_pages += 1
        html = fp.read_text(encoding="utf-8")
        soup = BeautifulSoup(html, "lxml")
        main = soup.find("main") or soup.find("article") or soup.body
        pws = main.find_all("div", class_="pembahasan-wr")
        if not pws:
            continue
        if len(pws) >= 1:
            pages_with_5_questions += 1
        page_answered = 0
        for pw in pws:
            jw = pw.find("div", class_="jawaban")
            if jw:
                m = re.search(r"Jawaban\s*:\s*([a-eA-E])", jw.get_text(" ", strip=True))
                if m:
                    page_answered += 1
            total_questions += 1
        total_answered += page_answered
        if page_answered > 0:
            pages_with_answer += 1

print(f"TKP cached pages found     : {total_pages}")
print(f"Pages w/ pembahasan-wr     : {pages_with_5_questions}")
print(f"Pages w/ at least 1 answer : {pages_with_answer}")
print(f"Total questions in caches  : {total_questions}")
print(f"Total with answer extracted: {total_answered}  ({total_answered*100//max(1,total_questions)}%)")
