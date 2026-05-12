from pathlib import Path
from bs4 import BeautifulSoup
import hashlib, re

CACHE = Path(r"c:\Users\dimas\Documents\Other\Lulusin\attached_assets\crawling_result\cache_belajarbro")
url = "https://belajarbro.id/cpns/skd/tkp/soal-jejaring-kerja-1"
h = hashlib.md5(url.encode()).hexdigest()
fp = CACHE / f"{h}.html"
html = fp.read_text(encoding="utf-8")
soup = BeautifulSoup(html, "lxml")
main = soup.find("main") or soup.find("article") or soup.body

# Find pembahasan-wr divs and dump their jawaban
pws = main.find_all("div", class_="pembahasan-wr")
print(f"pembahasan-wr count: {len(pws)}")
for i, pw in enumerate(pws[:3]):
    jw = pw.find("div", class_="jawaban")
    if jw:
        print(f"\n--- pembahasan-wr[{i}] jawaban div HTML (first 400 chars):")
        print(str(jw)[:400])
        print(f"--- text: {repr(jw.get_text(' ', strip=True))[:300]}")
