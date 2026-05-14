# Deret Angka

> **Bagian dari**: Tes Intelegensi Umum (TIU) — Kemampuan Numerik  
> **Tingkat kesulitan**: ⭐⭐⭐ (sedang, sering muncul di SKD CPNS)

---

## 📖 Apa itu Deret Angka?

**Deret angka** adalah barisan bilangan yang disusun mengikuti **pola tertentu**. Tugas Anda dalam tes adalah:
1. Mengenali pola yang menghubungkan angka-angka tersebut
2. Menemukan angka selanjutnya (atau angka di tengah yang hilang)

Soal deret angka di SKD CPNS biasanya muncul **3–7 nomor** dari total ~30 soal TIU. Kunci utamanya: **cepat mengenali jenis pola**.

---

## 🎯 6 Jenis Pola Deret yang Wajib Dikuasai

### 1. Deret Aritmatika (beda tetap)

Selisih antar suku selalu sama.

**Rumus:** Uₙ = a + (n−1)·b  
- a = suku pertama  
- b = beda (selisih konstan)  
- n = urutan suku

**Contoh:**
```
2, 5, 8, 11, 14, ...
   +3  +3  +3  +3
```
Selisih +3 → suku berikut: 14 + 3 = **17**

---

### 2. Deret Geometri (rasio tetap)

Setiap suku dikalikan/dibagi dengan angka yang sama.

**Rumus:** Uₙ = a · rⁿ⁻¹  
- r = rasio (perbandingan antar suku)

**Contoh:**
```
3, 6, 12, 24, 48, ...
  ×2  ×2  ×2  ×2
```
Rasio ×2 → suku berikut: 48 × 2 = **96**

**Variasi:** rasio bisa juga pecahan (÷3, ÷2, dll):
```
81, 27, 9, 3, 1, ...   (÷3)
```

---

### 3. Deret Selisih Bertingkat (selisih makin besar/kecil)

Selisihnya membentuk pola sendiri (bukan tetap).

**Contoh 1 (selisih +1 tiap kali):**
```
1, 2, 4, 7, 11, 16, ...
  +1 +2 +3 +4  +5
```
Selisih berikut: +6 → 16 + 6 = **22**

**Contoh 2 (selisih kelipatan):**
```
2, 6, 12, 20, 30, ...
  +4 +6  +8  +10
```
Selisih +2 setiap langkah → berikut +12 → 30 + 12 = **42**

---

### 4. Deret Kuadrat / Kubik

Setiap suku adalah hasil pangkat dari urutan.

**Kuadrat:**
```
1, 4, 9, 16, 25, ...
1² 2² 3² 4² 5²
```
Suku ke-6 = 6² = **36**

**Kubik:**
```
1, 8, 27, 64, 125, ...
1³ 2³ 3³ 4³  5³
```
Suku ke-6 = 6³ = **216**

---

### 5. Deret Fibonacci (suku = jumlah 2 suku sebelum)

**Rumus:** Uₙ = Uₙ₋₁ + Uₙ₋₂

**Contoh:**
```
1, 1, 2, 3, 5, 8, 13, ...
       │   │  │   │
       1+1 1+2 2+3 3+5
```
Suku berikut: 8 + 13 = **21**

**Variasi Fibonacci**: bisa berbeda awal, tapi pola tetap "jumlah 2 sebelum":
```
2, 3, 5, 8, 13, 21, 34, ...
```

---

### 6. Deret Berselang (Dua Pola Tersisip)

Dua deret berbeda yang berselang-seling. Cara cepatnya: **pisahkan suku ganjil dan genap**.

**Contoh:**
```
2, 10, 4, 8, 6, 6, 8, 4, ...
```
Pisah:
- Suku ke-1, 3, 5, 7 (ganjil): 2, 4, 6, 8 → **+2 tiap kali**
- Suku ke-2, 4, 6, 8 (genap): 10, 8, 6, 4 → **−2 tiap kali**

Suku ke-9 (ganjil): 8 + 2 = **10**  
Suku ke-10 (genap): 4 − 2 = **2**

---

### 7. Deret Operasi Campuran (×n, +k, dll)

Pola bisa kombinasi: kali lalu tambah, atau pola berulang.

**Contoh:**
```
2, 5, 11, 23, 47, ...
   ×2+1 ×2+1 ×2+1 ×2+1
```
Suku berikut: 47 × 2 + 1 = **95**

**Contoh lain (×2, +3 berulang):**
```
4, 8, 11, 22, 25, 50, 53, ...
  ×2  +3  ×2  +3  ×2  +3
```
Suku berikut: 53 × 2 = **106**

---

## ⚡ Strategi Cepat Mengerjakan Deret

### Langkah 1: Cek SELISIH dulu
Tulis selisih antar suku. Kalau selisihnya **tetap** → deret aritmatika.

### Langkah 2: Cek RASIO
Bagi suku berikut dengan suku sebelum. Kalau hasilnya **sama (=r)** → deret geometri.

### Langkah 3: Cek SELISIH SELISIH
Kalau selisih tidak tetap, hitung selisih dari selisih. Sering muncul pola "selisih +1, +2, +3, ..." atau "selisih +2, +2, +2".

### Langkah 4: Cek POLA KUADRAT/KUBIK
Kalau angkanya tumbuh cepat (loncat besar), curigai n², n³, atau n!.

### Langkah 5: Cek FIBONACCI
Kalau angkanya tumbuh sedang & tidak match pola 1–4: cek "suku = 2 suku sebelum dijumlahkan".

### Langkah 6: Cek BERSELANG
Kalau pola "naik-turun" atau angka tidak monoton → coba pisahkan ganjil-genap.

### Langkah 7: Pola CAMPURAN
Kalau semua di atas tidak match → coba ×n+k, atau bagi jadi dua langkah berbeda (kali, tambah, kali, tambah).

---

## 💡 Tips & Trik Penting

| Tip | Penjelasan |
|-----|-----------|
| **Mulai dari yang paling sederhana** | Cek aritmatika dulu (paling mudah), baru ke yang kompleks |
| **Tulis selisih di antara angka** | Visualisasi pola lebih cepat — biasakan corat-coret |
| **Jangan asal tebak rumus** | Verifikasi dengan 2–3 suku, jangan cuma 1 |
| **Selisih besar = curigai kali/pangkat** | Angka melompat jauh = bukan aritmatika |
| **Jumlah suku banyak (≥6 suku)** = berselang | Pola panjang biasanya menyembunyikan 2 sub-deret |
| **Cek polanya 2 arah** | Kadang lebih mudah dilihat dari kanan ke kiri |

---

## 📝 Contoh Soal & Pembahasan

### Soal 1 (Tingkat Mudah)
**3, 7, 11, 15, 19, ...**

**Cara**: cek selisih → +4, +4, +4, +4 → aritmatika beda 4.  
**Jawaban**: 19 + 4 = **23**

---

### Soal 2 (Tingkat Sedang)
**5, 10, 20, 40, ...**

**Cara**: cek rasio → 10÷5=2, 20÷10=2, 40÷20=2 → geometri rasio 2.  
**Jawaban**: 40 × 2 = **80**

---

### Soal 3 (Tingkat Sedang)
**1, 4, 10, 22, 46, ...**

**Cara**: 
- Selisih: +3, +6, +12, +24 → selisih jadi kali 2  
- Atau: pola ×2+2 → 1·2+2=4, 4·2+2=10, 10·2+2=22, 22·2+2=46 ✓

**Jawaban**: 46 × 2 + 2 = **94**

---

### Soal 4 (Tingkat Sulit — berselang)
**3, 100, 6, 95, 9, 90, ..., ...**

**Cara**: pisahkan
- Ganjil (3, 6, 9, ...): +3 tiap kali → berikut = 12
- Genap (100, 95, 90, ...): −5 tiap kali → berikut = 85

**Jawaban**: **12, 85**

---

### Soal 5 (Tingkat Sulit — Fibonacci variasi)
**2, 3, 5, 8, 13, 21, ...**

**Cara**: cek apakah suku = 2 sebelum + 2 sebelum lagi
- 2 + 3 = 5 ✓
- 3 + 5 = 8 ✓
- 5 + 8 = 13 ✓
- 8 + 13 = 21 ✓

**Jawaban**: 13 + 21 = **34**

---

### Soal 6 (Tingkat Sulit — campuran ×2, −1)
**3, 5, 9, 17, 33, 65, ...**

**Cara**: 
- Selisih: +2, +4, +8, +16, +32 → selisih kali 2  
- Atau: pola ×2−1 → 3·2−1=5, 5·2−1=9, 9·2−1=17 ✓

**Jawaban**: 65 × 2 − 1 = **129**

---

## ⚠️ Kesalahan Umum yang Harus Dihindari

1. **Terburu-buru pakai rumus**  
   Jangan langsung asumsi aritmatika tanpa verifikasi 2–3 suku.

2. **Tidak cek konsistensi pola**  
   Pastikan pola berlaku untuk **semua** suku, bukan hanya 2 suku pertama.

3. **Lupa kemungkinan deret berselang**  
   Kalau angkanya naik-turun atau ada pola aneh, pisahkan dulu.

4. **Salah hitung manual**  
   Soal deret sering kena di kesalahan aritmetika sederhana. Cek ulang penjumlahan/perkalian.

5. **Tidak coba pola dari kanan**  
   Kadang dari belakang (suku terakhir mundur) pola lebih jelas.

---

## 🎯 Target Kemampuan

Untuk SKD CPNS, target Anda:
- **Tingkat mudah** (aritmatika, geometri): selesai dalam **< 15 detik**
- **Tingkat sedang** (selisih bertingkat, kuadrat): selesai dalam **< 30 detik**
- **Tingkat sulit** (berselang, campuran): selesai dalam **< 60 detik**

**Skor target TIU**: minimal **80 dari 175** (4 dari 7 soal deret terjawab benar).

---

## 🔁 Latihan Mandiri

Coba kerjakan deret berikut sebelum lanjut ke topik berikutnya:

1. `7, 14, 28, 56, ...` 
2. `1, 3, 6, 10, 15, ...`
3. `100, 81, 64, 49, 36, ...`
4. `2, 4, 8, 14, 22, ...`
5. `5, 1, 10, 2, 15, 3, ...`

**Kunci jawaban:**
1. 112 (×2)
2. 21 (+2,+3,+4,+5,+6)
3. 25 (kuadrat menurun: 10², 9², 8², 7², 6², 5²)
4. 32 (+2,+4,+6,+8,+10)
5. 20, 4 (berselang: +5 dan +1)

---

*Materi belajar TIU CPNS — silakan dipakai, dimodifikasi, dan dibagikan untuk pembelajaran pribadi.*
