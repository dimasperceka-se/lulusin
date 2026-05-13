# Berhitung Cepat

> **Bagian dari**: TIU — Kemampuan Numerik  
> **Tingkat kesulitan**: ⭐⭐ (mudah-sedang, basic)

---

## 📖 Apa itu Berhitung Cepat?

Soal **berhitung cepat** menguji kemampuan dasar aritmetika: penjumlahan, pengurangan, perkalian, pembagian, kuadrat, akar, pangkat. Tujuannya bukan untuk soal sulit, melainkan soal yang **cepat dan akurat**.

Di SKD CPNS, biasanya muncul **3–5 soal** dari ~30 soal TIU.

⏱️ Target: **< 30 detik per soal**. Tidak ada kalkulator — andalkan trik!

---

## 🎯 Operasi Dasar yang Harus Cepat

### 1. Perkalian Cepat

#### Perkalian 11 (untuk angka 2 digit)
```
  AB × 11 = A_(A+B)_B
  
Contoh: 23 × 11 = 2_(2+3)_3 = 253
        45 × 11 = 4_(4+5)_5 = 495
        78 × 11 = 7_(7+8)_8 = 7(15)8 = 858 (geser 1)
```

#### Perkalian dengan 5
```
n × 5 = (n × 10) / 2
       = n/2, lalu × 10

Contoh: 84 × 5 = 84/2 = 42 → 420
        46 × 5 = 23 → 230
```

#### Perkalian dengan 25
```
n × 25 = (n × 100) / 4
        = n/4, lalu × 100

Contoh: 16 × 25 = 4 → 400
        32 × 25 = 8 → 800
        48 × 25 = 12 → 1200
```

#### Perkalian dua angka mendekati 100
```
98 × 96 = ?

Kompensasi: 
- (100-98)=2, (100-96)=4
- 98 - 4 = 94 atau 96 - 2 = 94
- 2 × 4 = 08
- Hasil: 9408

Contoh: 97 × 95 = (97-5) | (3×5) = 92 | 15 = 9215
```

---

### 2. Pembagian Cepat

#### Cek habis dibagi
- Habis dibagi **2**: angka terakhir genap
- Habis dibagi **3**: jumlah digitnya kelipatan 3
- Habis dibagi **5**: angka terakhir 0 atau 5
- Habis dibagi **9**: jumlah digitnya kelipatan 9
- Habis dibagi **11**: selisih jumlah digit ganjil & genap = 0 atau kelipatan 11

Contoh: 234 habis dibagi 9? Jumlah digit = 2+3+4 = 9 ✓ → ya.

---

### 3. Kuadrat & Akar yang HARUS Hafal

#### Kuadrat 1–20 (WAJIB hafal di luar kepala!)

| n | n² | n | n² |
|---|---|---|---|
| 1 | 1 | 11 | 121 |
| 2 | 4 | 12 | 144 |
| 3 | 9 | 13 | 169 |
| 4 | 16 | 14 | 196 |
| 5 | 25 | 15 | 225 |
| 6 | 36 | 16 | 256 |
| 7 | 49 | 17 | 289 |
| 8 | 64 | 18 | 324 |
| 9 | 81 | 19 | 361 |
| 10 | 100 | 20 | 400 |

#### Trik kuadrat angka berakhiran 5
```
n5² = n(n+1) | 25

Contoh: 25² = 2×3 | 25 = 625
        35² = 3×4 | 25 = 1225
        65² = 6×7 | 25 = 4225
        95² = 9×10 | 25 = 9025
```

#### Pangkat tiga (kubik) yang penting

| n | n³ |
|---|----|
| 1 | 1 |
| 2 | 8 |
| 3 | 27 |
| 4 | 64 |
| 5 | 125 |
| 6 | 216 |
| 7 | 343 |
| 8 | 512 |
| 9 | 729 |
| 10 | 1000 |

---

### 4. Persen Penting

Hafalan cepat:
- 50% = ½
- 25% = ¼
- 75% = ¾
- 20% = 1/5
- 10% = 1/10
- 33⅓% = 1/3
- 66⅔% = 2/3
- 12,5% = 1/8
- 5% = 1/20

**Trik 10% & turunannya:**
- 10% = geser koma 1 ke kiri (15 → 1,5)
- 5% = 10% ÷ 2
- 1% = geser koma 2 ke kiri (15 → 0,15)
- 20% = 10% × 2

---

### 5. Pecahan ↔ Desimal (hafalan)

| Pecahan | Desimal |
|---------|---------|
| 1/2 | 0,5 |
| 1/3 | 0,333 |
| 1/4 | 0,25 |
| 1/5 | 0,2 |
| 1/6 | 0,166 |
| 1/8 | 0,125 |
| 1/10 | 0,1 |
| 2/3 | 0,666 |
| 3/4 | 0,75 |
| 3/8 | 0,375 |
| 5/8 | 0,625 |

---

## ⚡ Strategi Cepat

### Langkah 1: KENALI POLA OPERASI

- Lihat angka — apakah ada trik (× 5, × 25, × 11, kuadrat 5)?
- Kalau iya, pakai trik. Kalau tidak, hitung biasa.

### Langkah 2: PRIORITAS OPERASI (PEMDAS / "Kurung-Eksponen-Kali/Bagi-Tambah/Kurang")

1. Kurung dulu
2. Eksponen/akar
3. Perkalian/pembagian (dari kiri)
4. Penjumlahan/pengurangan (dari kiri)

### Langkah 3: PEMECAHAN ANGKA

`23 × 12 = ?`
- 23 × 12 = 23 × (10+2) = 230 + 46 = 276

### Langkah 4: APPROXIMASI ke OPSI

Kalau jawaban dekat dengan satu opsi saja, langsung pilih (tanpa hitung tepat).

---

## 💡 Tips & Trik Penting

| Tip | Penjelasan |
|-----|-----------|
| **Hafalkan kuadrat 1-20** | Wajib! Hemat waktu di banyak soal |
| **Hafalkan pecahan ↔ desimal** | Konversi cepat di soal pecahan |
| **Pakai trik perkalian** | × 5, × 25, × 11, dll punya shortcut |
| **Pecah angka** | 23 × 12 = (23×10) + (23×2) |
| **Estimasi dulu** | Untuk pilih jawaban kasar, lalu refine |
| **Cek opsi** | Kadang opsi sudah cukup beda jauh untuk approximate |

---

## 📝 Contoh Soal & Pembahasan

### Soal 1 (Mudah)
**25% × 80 + 30% × 60 = ?**

**Cara cepat:**
- 25% × 80 = 80/4 = 20
- 30% × 60 = 0,3 × 60 = 18
- Total: 20 + 18 = **38**

---

### Soal 2 (Mudah)
**√144 + √81 = ?**

**Cara cepat:** Hafalan kuadrat.
- √144 = 12
- √81 = 9
- Total: **21**

---

### Soal 3 (Sedang)
**(0,25 × 16) + (0,5 × 20) = ?**

**Cara cepat:**
- 0,25 × 16 = 16/4 = 4
- 0,5 × 20 = 20/2 = 10
- Total: 4 + 10 = **14**

---

### Soal 4 (Sedang — kuadrat berakhiran 5)
**Hitung 65² = ?**

**Cara cepat (trik):** 6 × 7 | 25 = 42 | 25 = **4225**

---

### Soal 5 (Sulit — kombinasi)
**Jika x = 5, hitung 2x² − 3x + 10**

**Cara cepat:**
- x² = 25
- 2x² = 50
- 3x = 15
- 50 − 15 + 10 = **45**

---

## ⚠️ Kesalahan Umum

1. **Salah PEMDAS**  
   Operasi harus urut: kurung dulu, baru kali/bagi, baru tambah/kurang.

2. **Tergesa-gesa**  
   Hitung cepat tapi salah = tidak ada poin. Lebih baik akurat.

3. **Lupa hafalan dasar**  
   Kuadrat 1-20, pecahan ke desimal—harus refleks.

4. **Tidak pakai trik**  
   Soal yang bisa pakai shortcut malah dihitung manual = boros waktu.

5. **Tidak cek opsi sebelum hitung**  
   Kadang opsi sangat berbeda, estimasi sudah cukup.

---

## 🎯 Target Kemampuan

- **Soal 1 operasi**: < 10 detik
- **Soal 2-3 operasi**: < 20 detik
- **Soal kompleks**: < 30 detik

**Target benar**: minimal **4 dari 5** soal berhitung.

---

## 🔁 Latihan Mandiri

1. 15% × 240 = ?
2. √169 + 3² = ?
3. 35² = ? (pakai trik)
4. 0,4 × 0,25 + 0,1 = ?
5. (7 + 3) × (5 − 2) ÷ 6 = ?

**Kunci jawaban:**
1. 36
2. 22 (13 + 9)
3. 1225 (3×4 | 25)
4. 0,2 (0,1 + 0,1)
5. 5 (10 × 3 ÷ 6)

---

*Materi belajar TIU CPNS — silakan dipakai, dimodifikasi, dan dibagikan untuk pembelajaran pribadi.*
