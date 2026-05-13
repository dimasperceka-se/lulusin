# Statistika Dasar

> **Bagian dari**: TIU — Kemampuan Numerik  
> **Tingkat kesulitan**: ⭐⭐ (mudah-sedang, hampir pasti muncul 1-2 soal)

---

## 📖 Apa itu Statistika Dasar?

**Statistika dasar** dalam TIU CPNS mencakup pengolahan data sederhana: menghitung **rata-rata (mean)**, **nilai tengah (median)**, **nilai paling sering (modus)**, dan **rentang (range)**. Plus kemampuan membaca **tabel** & **diagram**.

Soal statistika di SKD biasanya muncul dalam bentuk:
- "Berapa rata-rata nilai siswa yang ..."
- "Jika ditambah satu data baru, berapa rata-rata baru?"
- Soal yang memakai tabel/grafik untuk dijawab

---

## 🎯 4 Konsep Utama

### 1. Rata-Rata (Mean) — Paling Sering Muncul

**Rumus:**
```
Rata-rata = Jumlah semua data ÷ Banyak data
```

**Contoh:**
Nilai ulangan: 70, 80, 85, 65, 90
- Jumlah = 70+80+85+65+90 = 390
- Banyak data = 5
- Rata-rata = 390 ÷ 5 = **78**

---

### 2. Median (Nilai Tengah)

**Cara**:
1. Urutkan data dari kecil ke besar (atau sebaliknya)
2. Cari nilai TENGAH

**Kalau jumlah data ganjil**: median = data tepat di tengah.  
**Kalau jumlah data genap**: median = rata-rata 2 data tengah.

**Contoh ganjil:**
Data: 5, 8, 3, 9, 6 → urutkan: **3, 5, 6, 8, 9**  
Median = data ke-3 = **6**

**Contoh genap:**
Data: 2, 4, 6, 8, 10, 12 (sudah urut)  
Median = (6+8) ÷ 2 = **7**

---

### 3. Modus (Yang Paling Sering Muncul)

Modus = data dengan frekuensi tertinggi.

**Contoh:**
Data: 4, 7, 7, 8, 9, 7, 5  
Angka 7 muncul 3 kali (paling banyak) → **Modus = 7**

**Catatan:**
- Bisa ada lebih dari 1 modus (bimodal, multimodal)
- Bisa juga tidak ada modus (jika semua data muncul 1 kali)

---

### 4. Range (Jangkauan)

**Rumus:**
```
Range = Data terbesar − Data terkecil
```

**Contoh:**
Data: 12, 7, 18, 25, 9 → terbesar = 25, terkecil = 7  
Range = 25 − 7 = **18**

---

## ⚡ Trik Cepat untuk Soal Rata-Rata

### Trik 1: Rumus Total
```
Total = Rata-rata × Banyak data
```
Sangat berguna untuk soal "berapa data baru agar rata-rata tertentu".

### Trik 2: Rata-Rata Gabungan
Jika 2 kelompok punya rata-rata berbeda:
```
Rata-rata gabungan = (n₁·x̄₁ + n₂·x̄₂) ÷ (n₁ + n₂)
```
- n₁, n₂ = jumlah data tiap kelompok
- x̄₁, x̄₂ = rata-rata tiap kelompok

**Contoh:**  
- Kelas A: 20 siswa, rata-rata 75
- Kelas B: 30 siswa, rata-rata 80

Rata-rata gabungan = (20×75 + 30×80) ÷ (20+30)  
= (1500 + 2400) ÷ 50  
= 3900 ÷ 50 = **78**

### Trik 3: Penambahan/Pengurangan Data
- Rata-rata BARU = rata-rata + (data baru − rata-rata) ÷ (n+1)

**Contoh:**
Rata-rata 5 nilai = 70. Ditambah nilai ke-6 = 88.  
Rata-rata baru = 70 + (88−70) ÷ 6 = 70 + 18/6 = 70 + 3 = **73**

Atau cara langsung: (70×5 + 88) ÷ 6 = 438/6 = 73. Sama.

---

## 💡 Tips & Trik Penting

| Tip | Penjelasan |
|-----|-----------|
| **Pahami "total = rata × n"** | Trik paling sering dipakai untuk soal SKD |
| **Selalu urutkan data dulu untuk median** | Sering lupa → jawaban salah |
| **Modus bisa lebih dari satu** | Jangan asumsi hanya satu |
| **Rata-rata sensitif terhadap data ekstrem** | Median lebih stabil |
| **Baca tabel/grafik dengan teliti** | Soal sering jebak di interpretasi data |
| **Hati-hati satuan/skala grafik** | Pastikan baca sumbu Y dengan benar |

---

## 📝 Contoh Soal & Pembahasan

### Soal 1 (Mudah)
**Nilai 5 mata pelajaran: 80, 75, 90, 85, 70. Berapa rata-ratanya?**

**Cara**: (80+75+90+85+70) ÷ 5 = 400 ÷ 5  
**Jawaban**: **80**

---

### Soal 2 (Mudah)
**Tentukan median dari data: 12, 8, 15, 6, 10, 9, 14**

**Cara**: urutkan → 6, 8, 9, **10**, 12, 14, 15. Jumlah data 7 (ganjil), median = data ke-4.  
**Jawaban**: **10**

---

### Soal 3 (Sedang)
**Rata-rata 4 nilai = 75. Jika ditambah nilai ke-5 = 90, berapa rata-rata baru?**

**Cara**: 
- Total awal = 75 × 4 = 300
- Total baru = 300 + 90 = 390
- Rata-rata baru = 390 ÷ 5 = **78**

---

### Soal 4 (Sedang)
**Rata-rata 6 anak adalah 60. Setelah dikeluarkan satu anak, rata-rata jadi 65. Berapa nilai anak yang dikeluarkan?**

**Cara**: 
- Total 6 anak = 60 × 6 = 360
- Total 5 anak (sisa) = 65 × 5 = 325
- Nilai yang dikeluarkan = 360 − 325 = **35**

---

### Soal 5 (Sedang)
**Rata-rata berat badan 30 siswa pria = 60 kg. Rata-rata berat 20 siswa wanita = 50 kg. Rata-rata gabungan = ?**

**Cara**: rumus gabungan
- Total = (30×60) + (20×50) = 1800 + 1000 = 2800
- Banyak data = 30 + 20 = 50
- Rata-rata = 2800 ÷ 50 = **56 kg**

---

### Soal 6 (Sulit)
**Data: 4, 6, 6, 7, 8, 9, x. Jika modusnya 6 dan mediannya 7, berapa kemungkinan nilai x?**

**Cara**: 
- Median = data ke-4 (data ke-(7+1)/2)
- Data sudah terurut → data ke-4 = 7 ✓
- Modus 6 (muncul 2 kali) — paling banyak. x tidak boleh sama-sama 2 kali (kecuali memang multimodal).
- x boleh nilai apa saja yang muncul ≤ 1 kali dan tidak membuat angka 7 jadi modus baru.

**Jawaban**: x bisa 4 atau 5 (tidak mengubah median & modus) — pilih sesuai opsi soal.

---

### Soal 7 (Sulit – tabel)
**Tabel nilai ulangan:**

| Nilai | Frekuensi |
|-------|-----------|
| 6     | 5         |
| 7     | 8         |
| 8     | 10        |
| 9     | 4         |
| 10    | 3         |

**Berapa rata-rata nilai ulangan?**

**Cara**: rata-rata = Σ(nilai × frekuensi) ÷ Σfrekuensi
- Total = (6×5)+(7×8)+(8×10)+(9×4)+(10×3) = 30+56+80+36+30 = 232
- Σfrekuensi = 5+8+10+4+3 = 30
- Rata-rata = 232 ÷ 30 = **7.73**

---

## ⚠️ Kesalahan Umum

1. **Tidak mengurutkan data untuk median**  
   Median tanpa urut = angka salah.

2. **Salah hitung jumlah data ganjil/genap**  
   Data ganjil = 1 data tengah; genap = rata-rata 2 data tengah.

3. **Bingung rata-rata vs total**  
   `Rata-rata × n = total`. Untuk soal "data baru", pakai total.

4. **Tertukar mean & median**  
   Mean = rata-rata aritmatik; median = nilai tengah.

5. **Salah baca skala grafik**  
   Cek satuan & interval sumbu Y dengan teliti.

6. **Asumsi modus selalu 1**  
   Bisa banyak modus atau tidak ada sama sekali.

---

## 🎯 Target Kemampuan

- Rata-rata data sederhana (≤10 data): **< 20 detik**
- Median data ≤ 10: **< 30 detik** (termasuk waktu urut)
- Soal "rata-rata baru / lama": **< 45 detik**
- Membaca tabel frekuensi: **< 60 detik**

---

## 🔁 Latihan Mandiri

1. Rata-rata dari 5, 7, 9, 11, 13 = ?
2. Median dari 4, 8, 2, 6, 10, 3 = ?
3. Modus dari 1, 3, 3, 5, 7, 7, 7, 9 = ?
4. Rata-rata 6 angka = 50. Salah satu angka ternyata 60. Jika dihapus, rata-rata sisanya?
5. Range dari 25, 17, 32, 8, 41, 19 = ?

**Kunci:**
1. (5+7+9+11+13)/5 = 45/5 = **9**
2. Urut: 2,3,4,6,8,10 → genap, median = (4+6)/2 = **5**
3. **7** (muncul 3 kali, terbanyak)
4. Total awal = 300; tanpa 60 = 240; rata-rata = 240/5 = **48**
5. 41 − 8 = **33**

---

*Materi belajar TIU CPNS — silakan dipakai, dimodifikasi, dan dibagikan untuk pembelajaran pribadi.*
