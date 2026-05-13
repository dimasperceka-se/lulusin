# Aritmatika Sosial

> **Bagian dari**: TIU — Kemampuan Numerik  
> **Tingkat kesulitan**: ⭐⭐⭐ (sedang)

---

## 📖 Apa itu Aritmatika Sosial?

**Aritmatika sosial** = penerapan matematika dalam kehidupan sehari-hari, terutama dunia jual-beli & keuangan. Mencakup:
- Untung & rugi
- Diskon
- Bunga (sederhana & majemuk)
- Pajak
- Bruto, neto, tara

Muncul **2–4 soal** di SKD CPNS dan sangat aplikatif.

---

## 🎯 Konsep & Rumus Utama

### 1. Harga Beli, Harga Jual, Untung, Rugi

```
Untung = Harga Jual − Harga Beli   (jika Harga Jual > Harga Beli)
Rugi   = Harga Beli − Harga Jual   (jika Harga Beli > Harga Jual)
```

**Persentase untung/rugi (selalu dari HARGA BELI):**
```
% Untung = (Untung / Harga Beli) × 100%
% Rugi   = (Rugi / Harga Beli) × 100%
```

---

### 2. Diskon (Potongan Harga)

```
Diskon = Harga Awal × (% diskon / 100)
Harga setelah diskon = Harga Awal − Diskon
                     = Harga Awal × (1 − % diskon/100)
```

**Contoh:**  
Harga 200.000, diskon 25% → bayar 200.000 × 0,75 = **150.000**

#### Diskon Ganda (BERTINGKAT)
⚠️ Diskon 20% + 10% ≠ 30%!

```
Harga akhir = Harga awal × (1 − d1) × (1 − d2)
```

**Contoh:**  
Harga 100.000, diskon 20% lalu 10%:
- Setelah diskon 1: 100.000 × 0,8 = 80.000
- Setelah diskon 2: 80.000 × 0,9 = 72.000  
(Bukan 70.000!)

---

### 3. Bunga Sederhana (Simple Interest)

Bunga dihitung HANYA dari modal awal, tidak menumpuk.

```
Bunga = Modal × Persen Bunga × Waktu
B = M × (b%/100) × t

dengan t dalam tahun.
```

**Bunga per bulan:** kalau persen tahunan, bagi 12:
```
B per bulan = M × b%/100 / 12
```

---

### 4. Bunga Majemuk (Compound Interest)

Bunga ditambahkan ke modal, lalu bunga periode berikutnya dari modal+bunga.

```
Total = M × (1 + b%/100)^t

dengan t = jumlah periode.
```

**Contoh:**  
Tabung 1.000.000, bunga 10%/tahun, 3 tahun:
- Tahun 1: 1.000.000 × 1,1 = 1.100.000
- Tahun 2: 1.100.000 × 1,1 = 1.210.000
- Tahun 3: 1.210.000 × 1,1 = 1.331.000  
Atau langsung: 1.000.000 × 1,1³ = 1.331.000

---

### 5. Pajak

#### Pajak Penghasilan (PPh)
```
Pajak = Gaji × (% pajak / 100)
Gaji bersih = Gaji − Pajak
```

#### Pajak Pertambahan Nilai (PPN) — biasanya 11%
```
Harga + PPN = Harga × (1 + 11%/100)
            = Harga × 1,11
```

---

### 6. Bruto, Neto, Tara

```
Bruto = berat keseluruhan (isi + bungkus)
Neto  = berat bersih (isi saja)
Tara  = berat bungkus

Bruto = Neto + Tara
% Tara = (Tara / Bruto) × 100%
```

**Contoh:**  
Beras karungan bruto 50 kg, tara 2%. Neto = ?
- Tara = 2% × 50 = 1 kg
- Neto = 50 − 1 = 49 kg

---

## ⚡ Strategi Cepat

### Langkah 1: KENALI APA YANG DICARI

Baca soal pelan-pelan. Yang dicari "harga beli"? "Persen untung"? "Total bayar"?

### Langkah 2: TULIS YANG DIKETAHUI

Misal: HB = ?, HJ = 120.000, untung = 20.000

### Langkah 3: PILIH RUMUS YANG TEPAT

- Cari untung/rugi → HJ − HB atau HB − HJ
- Cari %: pakai HARGA BELI sebagai penyebut
- Diskon bertingkat → hitung BERTAHAP

### Langkah 4: VERIFIKASI ANGKA

Hasil masuk akal? Diskon 20% dari 100.000 bukan 30.000 — pasti 20.000.

---

## 💡 Tips & Trik

| Tip | Penjelasan |
|-----|-----------|
| **% selalu dari Harga Beli** | Untung/rugi dipersentasekan dari modal awal, bukan harga jual |
| **Diskon bertingkat = bertahap** | Jangan jumlahkan persennya |
| **"Bayar 75%" = "diskon 25%"** | Sering opsi pakai bentuk ini |
| **Bunga sederhana vs majemuk** | Kalau bilang "berbunga", default = sederhana |
| **Cek satuan waktu** | Bunga per tahun? Soal nya per bulan? Konversi! |
| **Bruto-Neto-Tara**: hafalkan rumus | Sering tertukar mana yang mana |

---

## 📝 Contoh Soal & Pembahasan

### Soal 1 (Mudah — Untung)
**Pedagang beli barang 80.000, jual dengan untung 25%. Harga jual?**

**Pembahasan:**
- Untung = 25% × 80.000 = 20.000
- Harga jual = 80.000 + 20.000 = **100.000**

**Atau:** HJ = HB × 1,25 = 80.000 × 1,25 = 100.000

**Jawaban: Rp 100.000**

---

### Soal 2 (Mudah — Diskon)
**Harga awal Rp 250.000, diskon 20%. Bayar berapa?**

**Pembahasan:**
- Bayar = 250.000 × (1 − 0,2) = 250.000 × 0,8 = **200.000**

**Jawaban: Rp 200.000**

---

### Soal 3 (Sedang — Persen Untung)
**Beli 60.000, jual 75.000. Persen untung?**

**Pembahasan:**
- Untung = 75.000 − 60.000 = 15.000
- % Untung = 15.000 / 60.000 × 100% = 25%

**Jawaban: 25%**

---

### Soal 4 (Sedang — Bunga Sederhana)
**Tabung 5.000.000 dengan bunga 6%/tahun. Berapa bunga setelah 8 bulan?**

**Pembahasan:**
- Bunga per tahun = 5.000.000 × 0,06 = 300.000
- 8 bulan = 8/12 tahun
- Bunga 8 bulan = 300.000 × 8/12 = 200.000

**Jawaban: Rp 200.000**

---

### Soal 5 (Sulit — Diskon Bertingkat)
**Harga baju Rp 400.000. Diskon 25% lalu diskon tambahan 20% untuk member. Total bayar?**

**Pembahasan:**
- Setelah diskon 25%: 400.000 × 0,75 = 300.000
- Setelah diskon 20%: 300.000 × 0,8 = **240.000**

**Jangan langsung 45% diskon = 220.000** (salah!)

**Jawaban: Rp 240.000**

---

### Soal 6 (Sulit — Cari Harga Beli)
**Pedagang jual barang 90.000 dengan untung 20%. Harga beli?**

**Pembahasan:**
- HJ = HB × (1 + 20%) = 1,2 × HB
- 90.000 = 1,2 × HB
- HB = 90.000 / 1,2 = **75.000**

**Jawaban: Rp 75.000**

---

### Soal 7 (Sulit — Bruto/Neto)
**Karung beras bertuliskan: bruto 50 kg, tara 4%. Berat bersih (neto)?**

**Pembahasan:**
- Tara = 4% × 50 = 2 kg
- Neto = 50 − 2 = **48 kg**

**Jawaban: 48 kg**

---

## ⚠️ Kesalahan Umum

1. **% dari HJ, bukan HB**  
   Persen untung/rugi dihitung dari Harga Beli (modal), bukan harga jual.

2. **Diskon bertingkat dijumlah**  
   Diskon 25% + 20% ≠ 45%. Harus bertahap!

3. **Salah konversi waktu bunga**  
   Bunga 6%/tahun ≠ 6%/bulan. Pakai pecahan waktu.

4. **Bunga sederhana vs majemuk salah pilih**  
   Kalau soal bilang "berbunga selama 3 tahun, total..." cek apakah ditegaskan majemuk.

5. **Lupa rumus dasar bruto-neto**  
   Bruto = berat total (termasuk bungkus). Neto = isi saja.

---

## 🎯 Target Kemampuan

- **Soal untung/rugi dasar**: < 30 detik
- **Diskon, bunga sederhana**: < 45 detik
- **Diskon bertingkat, bunga majemuk**: < 60 detik
- **Cari nilai awal (reverse)**: < 60 detik

---

## 🔁 Latihan Mandiri

1. Beli 50.000, jual 60.000. Persen untung?
2. Harga 300.000, diskon 30%. Bayar?
3. Tabung 2.000.000, bunga 8%/tahun, 6 bulan. Total uang?
4. Diskon 10% lalu 20%. Total efek diskon?
5. HJ = 121.000 dengan rugi 10%. HB?
6. Karung 25 kg, neto 23 kg. % tara?

**Kunci jawaban:**
1. 20% (10.000/50.000)
2. 210.000 (300.000 × 0,7)
3. 2.080.000 (M=2.000.000; bunga=80.000)
4. 28% (akhir = 0,9 × 0,8 = 0,72 → diskon total 28%)
5. 134.444 (HB = 121.000 / 0,9)
6. 8% (tara=2; 2/25 × 100%)

---

*Materi belajar TIU CPNS — silakan dipakai, dimodifikasi, dan dibagikan untuk pembelajaran pribadi.*
