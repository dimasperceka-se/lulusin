# Akar dan Pangkat

> **Bagian dari**: TIU — Kemampuan Numerik  
> **Tingkat kesulitan**: ⭐⭐ (mudah-sedang, sering muncul di soal hitung cepat)

---

## 📖 Apa itu Pangkat & Akar?

**Pangkat (eksponen)** = perkalian berulang suatu bilangan dengan dirinya sendiri.  
**Akar** = operasi kebalikan dari pangkat — mencari bilangan yang jika dipangkatkan menghasilkan angka tertentu.

```
Pangkat:  2³ = 2 × 2 × 2 = 8
Akar:     ∛8 = 2  (karena 2³ = 8)
```

Di TIU CPNS, soal pangkat & akar sering muncul dalam:
- Berhitung cepat (kuadrat, kubik)
- Soal cerita (luas persegi, volume kubus)
- Deret bilangan (pola n², n³)

---

## 🎯 Konsep Dasar Pangkat

### 1. Definisi
```
aⁿ = a × a × a × ... × a   (sebanyak n kali)
```
Misalnya: `5⁴ = 5 × 5 × 5 × 5 = 625`

### 2. Sifat-sifat Pangkat (WAJIB hafal!)

| Sifat | Rumus | Contoh |
|-------|-------|--------|
| Perkalian basis sama | aᵐ × aⁿ = aᵐ⁺ⁿ | 2³ × 2⁴ = 2⁷ = 128 |
| Pembagian basis sama | aᵐ ÷ aⁿ = aᵐ⁻ⁿ | 5⁶ ÷ 5² = 5⁴ = 625 |
| Pangkat dari pangkat | (aᵐ)ⁿ = aᵐˣⁿ | (3²)³ = 3⁶ = 729 |
| Pangkat 0 | a⁰ = 1 | 7⁰ = 1, 100⁰ = 1 |
| Pangkat negatif | a⁻ⁿ = 1/aⁿ | 2⁻³ = 1/8 |
| Pangkat pecahan | a^(m/n) = ⁿ√(aᵐ) | 8^(2/3) = ∛(8²) = 4 |
| Perkalian dengan basis beda | (a×b)ⁿ = aⁿ × bⁿ | (2×3)² = 4×9 = 36 |

---

## 🎯 Konsep Dasar Akar

### 1. Akar Kuadrat (√)
Mencari bilangan yang dikuadratkan = angka di dalam akar.
```
√25 = 5    (karena 5² = 25)
√144 = 12  (karena 12² = 144)
```

### 2. Akar Pangkat n (ⁿ√)
```
∛8 = 2    (akar kubik: bilangan yang dikubikkan = 8)
⁴√16 = 2  (akar 4: bilangan yang dipangkatkan 4 = 16)
```

### 3. Sifat-sifat Akar

| Sifat | Rumus | Contoh |
|-------|-------|--------|
| Perkalian akar | √a × √b = √(a×b) | √2 × √8 = √16 = 4 |
| Pembagian akar | √a ÷ √b = √(a÷b) | √18 ÷ √2 = √9 = 3 |
| Akar dari akar | ⁿ√(ᵐ√a) = ⁿᵐ√a | ²√(∛64) = ⁶√64 = 2 |
| Penjumlahan akar | √a + √a = 2√a | √3 + √3 = 2√3 |
| Akar dipangkatkan | (√a)² = a | (√7)² = 7 |

⚠️ **PERHATIKAN**: `√a + √b ≠ √(a+b)`. Misal: `√9 + √16 = 3 + 4 = 7`, BUKAN `√25 = 5`.

---

## 📋 Tabel Hafalan Wajib

### Kuadrat 1–20
| n | n² | n | n² |
|---|-----|---|------|
| 1 | 1   | 11 | 121 |
| 2 | 4   | 12 | 144 |
| 3 | 9   | 13 | 169 |
| 4 | 16  | 14 | 196 |
| 5 | 25  | 15 | 225 |
| 6 | 36  | 16 | 256 |
| 7 | 49  | 17 | 289 |
| 8 | 64  | 18 | 324 |
| 9 | 81  | 19 | 361 |
| 10 | 100 | 20 | 400 |

### Kubik 1–10
| n | n³ |
|---|-----|
| 1 | 1   |
| 2 | 8   |
| 3 | 27  |
| 4 | 64  |
| 5 | 125 |
| 6 | 216 |
| 7 | 343 |
| 8 | 512 |
| 9 | 729 |
| 10 | 1000 |

### Pangkat 2 (2ⁿ) — sering muncul
| n | 2ⁿ |
|---|-----|
| 1 | 2 |
| 2 | 4 |
| 3 | 8 |
| 4 | 16 |
| 5 | 32 |
| 6 | 64 |
| 7 | 128 |
| 8 | 256 |
| 9 | 512 |
| 10 | 1024 |

---

## ⚡ Trik Cepat Akar Kuadrat (Bilangan Besar)

### Cara 1: Cek Angka Satuan
| Akar berakhir | Hasil kuadrat berakhir |
|---|---|
| 1 atau 9 | 1 |
| 2 atau 8 | 4 |
| 3 atau 7 | 9 |
| 4 atau 6 | 6 |
| 5 | 5 |
| 0 | 0 |

**Contoh**: `√2025 = ?`
- Berakhir 5 → akar berakhir 5
- 40² = 1600, 50² = 2500 → akar antara 40–50
- Hanya `45² = 2025` ✓ → **45**

### Cara 2: Faktorisasi
**Contoh**: `√324 = ?`  
- 324 = 4 × 81  
- √324 = √4 × √81 = 2 × 9 = **18**

### Cara 3: Estimasi Dekat
**Contoh**: `√576 = ?`
- 20² = 400, 25² = 625 → antara 20–25
- 23² = 529, 24² = 576 ✓ → **24**

---

## 💡 Tips & Trik Penting

| Tip | Penjelasan |
|-----|-----------|
| **Hafal kuadrat 1–20 & kubik 1–10** | Hemat banyak waktu, dasar semua soal |
| **Kenali pola angka satuan** | Bantu menentukan akar bilangan besar |
| **Faktorisasi prima** | Sangat membantu akar non-bulat |
| **Pangkat 0 selalu = 1** | (kecuali 0⁰ yang tak terdefinisi) |
| **Negatif kuadrat = positif** | (−3)² = 9, bukan −9 |
| **Hati-hati tanda kurung** | −3² = −9, tapi (−3)² = 9 |

---

## 📝 Contoh Soal & Pembahasan

### Soal 1 (Mudah)
**√144 + ∛27 = ?**

**Cara**: √144 = 12, ∛27 = 3.  
**Jawaban**: 12 + 3 = **15**

---

### Soal 2 (Mudah)
**Hasil dari 2³ + 3² adalah ...**

**Cara**: 2³ = 8, 3² = 9.  
**Jawaban**: 8 + 9 = **17**

---

### Soal 3 (Sedang)
**(2⁴ × 2³) ÷ 2² = ...**

**Cara**: pakai sifat pangkat — 2⁴ × 2³ = 2⁷, lalu ÷ 2² = 2⁵.  
**Jawaban**: 2⁵ = **32**

---

### Soal 4 (Sedang)
**√225 − ∛125 = ...**

**Cara**: √225 = 15 (karena 15² = 225), ∛125 = 5.  
**Jawaban**: 15 − 5 = **10**

---

### Soal 5 (Sedang)
**√(81 × 16) = ...**

**Cara**: pakai sifat √(a×b) = √a × √b → √81 × √16 = 9 × 4.  
**Jawaban**: **36**

---

### Soal 6 (Sulit)
**Bilangan yang nilainya sama dengan 4³ × 4⁻¹ adalah ...**

**Cara**: 4³ × 4⁻¹ = 4⁽³⁻¹⁾ = 4² = 16.  
**Jawaban**: **16**

---

### Soal 7 (Sulit – soal cerita)
**Sebuah kubus memiliki volume 343 cm³. Berapa panjang sisi kubus?**

**Cara**: V = s³ → s = ∛343 = 7 cm (karena 7³ = 343).  
**Jawaban**: **7 cm**

---

### Soal 8 (Sulit)
**Hasil dari √48 + √27 − √12 = ...**

**Cara**: sederhanakan tiap akar
- √48 = √(16×3) = 4√3
- √27 = √(9×3) = 3√3
- √12 = √(4×3) = 2√3

Hasilnya: 4√3 + 3√3 − 2√3 = **5√3**

---

## ⚠️ Kesalahan Umum

1. **(−a)² vs −a²**  
   `(−3)² = 9`, tapi `−3² = −9`. Beda hasilnya karena ada tidaknya tanda kurung.

2. **Penjumlahan akar**  
   `√4 + √9 = 2 + 3 = 5`, BUKAN `√13`.

3. **Tertukar perkalian dan penjumlahan pangkat**  
   `2³ × 2⁴ = 2⁷` (pangkat ditambah, bukan dikali).  
   `(2³)⁴ = 2¹²` (pangkat dikali).

4. **Lupa pangkat 0 = 1**  
   `7⁰ = 1`, bukan 0 atau 7.

5. **Akar dari pecahan**  
   `√(1/4) = 1/2`, bukan 1/√4 dibiarkan begitu.

---

## 🎯 Target Kemampuan

- Hitung kuadrat & kubik 1–10: **< 5 detik**
- Akar kuadrat bilangan ≤ 400: **< 10 detik**
- Sifat-sifat pangkat: **< 15 detik**
- Soal cerita akar/pangkat: **< 30 detik**

---

## 🔁 Latihan Mandiri

1. `√169 + √256 = ?`
2. `5² × 5³ = ?`
3. `∛216 − √81 = ?`
4. `(3² + 4²) = ?` (ini terkait Phytagoras!)
5. `√(36 + 64) = ?` (perhatikan kurung!)

**Kunci:**
1. 13 + 16 = **29**
2. 5⁵ = **3.125**
3. 6 − 9 = **−3**
4. 9 + 16 = **25** (= 5², segitiga 3-4-5!)
5. √100 = **10** (BUKAN 6+8 — akar dijumlah dulu di dalam)

---

*Materi belajar TIU CPNS — silakan dipakai, dimodifikasi, dan dibagikan untuk pembelajaran pribadi.*
