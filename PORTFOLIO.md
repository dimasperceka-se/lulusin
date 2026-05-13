# Lulusin — Platform Bimbingan Belajar CPNS

> **Live Demo:** [https://lulusin.hemitech.id](https://lulusin.hemitech.id)
> **Status:** Production · Deployed on Tencent Cloud
> **Klien:** Internal Hemitech (siap white-label untuk klien serupa)

---

## Ringkasan

**Lulusin** adalah Learning Management System (LMS) yang dirancang khusus untuk persiapan **Seleksi Kompetensi Dasar (SKD) CPNS**. Platform ini menggabungkan materi pembelajaran, bank soal terstruktur, simulasi tryout berbasis CBT (Computer Based Test), dan sistem ranking peserta — semuanya berjalan di satu domain dengan integrasi pembayaran otomatis.

Dikembangkan dan dioperasikan oleh Hemitech sebagai bukti kapabilitas full-stack: dari arsitektur database, REST API, frontend reaktif, sampai DevOps deployment dengan HTTPS dan auto-renewal cert.

---

## Untuk Siapa

| Segmen | Manfaat |
|---|---|
| **Calon CPNS** | Latihan SKD dengan 2.600+ soal TWK · TIU · TKP, lengkap dengan pembahasan |
| **Siswa SMA** | Persiapan UTBK (paket terpisah) |
| **Siswa SMP / SD** | Bimbingan Matematika dasar & Calistung |
| **Tutor / Bimbel** | Dashboard manajemen materi, soal, dan progress peserta |
| **Admin operasional** | Verifikasi pembayaran, kelola paket, monitor enrollment |

---

## Fitur Utama

### Untuk Peserta
- **Materi Pembelajaran Terstruktur** — 42 modul materi (TWK, TIU, TKP) berbasis markdown yang dirender langsung di browser
- **Bank Soal 2.600+** — soal pilihan ganda dengan pembahasan, terkategorisasi per topik (Nasionalisme, Analogi Kata, Pelayanan Publik, dst)
- **Quiz Per Topik** — 17 quiz tematik untuk drill per subtopik
- **Simulasi Tryout SKD** — mode CBT dengan timer, navigasi soal, dan auto-submit saat habis waktu
- **Leaderboard Real-time** — ranking otomatis per tryout, transparan dan kompetitif
- **Progress Tracking** — sistem mark sudah-baca per materi, persentase penyelesaian paket
- **Mobile Responsive** — desain optimal untuk laptop, tablet, dan smartphone

### Untuk Admin
- **Manajemen Paket** — buat / edit / nonaktifkan paket, set harga, durasi akses, mode maintenance
- **Manajemen Soal** — upload / edit soal bank, kelola tag dan kategori
- **Verifikasi Pembayaran** — review bukti transfer manual, approve / reject dengan alasan
- **Bank Account Settings** — kelola beberapa rekening bank tujuan transfer
- **Monitoring Order** — lihat semua transaksi, filter per status (Pending, Waiting Verification, Paid, Expired)

### Untuk Tutor
- Read-only akses ke daftar order
- Edit materi dan quiz pada paket yang ditugaskan

---

## Sistem Pembayaran (Dual Mode)

| Mode | Cara Kerja |
|---|---|
| **QRIS Otomatis** | User scan QR → bayar via e-wallet (GoPay, OVO, DANA, ShopeePay, dll) → backend polling status setiap 3 detik + webhook dari provider → status order otomatis menjadi `PAID` + enrollment ter-create → akses kursus instan |
| **Transfer Bank Manual** | User upload bukti transfer → admin review di dashboard → approve / reject → akses diberikan setelah approval |

Setiap order menggunakan **kode unik 3-digit acak** yang ditambahkan ke nominal pembayaran, memudahkan rekonsiliasi otomatis.

---

## Tech Stack

### Frontend
- **React 19** + **TypeScript 5.9**
- **Vite 7** sebagai build tool
- **Tailwind CSS 4** + **Radix UI** untuk komponen aksesibel
- **TanStack Query** untuk state management & data fetching
- **Wouter** untuk client-side routing
- **React Markdown** untuk render materi

### Backend
- **Node.js 24** + **Express 5**
- **TypeScript** dengan strict mode
- **Drizzle ORM** + **PostgreSQL 14+** untuk persistensi
- **Pino** untuk structured logging
- **Zod** untuk validasi input
- **JWT** untuk autentikasi session
- **bcrypt** untuk hashing password

### Infrastructure & DevOps
- **Tencent Cloud CVM** (Ubuntu 22.04 LTS)
- **PM2** untuk process manager Node.js
- **Nginx** sebagai reverse proxy + static file server
- **Let's Encrypt** SSL/TLS dengan auto-renewal via certbot
- **pnpm workspaces** untuk monorepo (frontend, backend, shared libs, scripts)
- **OpenAPI / Orval codegen** untuk type-safe API client

### Integrasi Eksternal
- **QRIS Interactive** (`qris.interactive.co.id`) — generate QR dinamis & konfirmasi pembayaran otomatis via webhook + polling
- **EmailJS** — email transaksional untuk verifikasi akun & reset password

---

## Arsitektur Singkat

```
┌──────────────┐     HTTPS     ┌─────────────┐    HTTP    ┌──────────────┐
│   Browser    │ ─────────────▶│   Nginx     │───────────▶│ Express API  │
│  (React App) │  (cert by     │  (proxy +   │  port 4000 │  (PM2)       │
└──────────────┘   certbot)    │   static)   │            └──────┬───────┘
                               └─────────────┘                   │
                                                                  ▼
                                                         ┌──────────────┐
                                                         │ PostgreSQL   │
                                                         │ (Drizzle ORM)│
                                                         └──────────────┘

                                              QRIS Interactive (push webhook)
                                                          │
                                                          ▼
                                                  /api/webhooks/qris
```

- **Frontend** di-bundle via Vite menjadi static assets, di-serve langsung oleh Nginx (cache-friendly)
- **Backend** Express bundle ESM single-file via esbuild, dijalankan oleh PM2 dengan auto-restart + memory limit
- **DB connection** pooling via `pg` driver, schema migrations via Drizzle Kit
- **Webhook QRIS** publik, idempotent — match payment ke order via `qrisInvoiceId` atau `orderCode`

---

## Highlight Engineering

- ✅ **Type-safe end-to-end** — OpenAPI spec → generated Zod schemas + React Query hooks. Backend handler menerima validated payload, frontend pakai typed responses
- ✅ **Idempotent webhook** — webhook QRIS bisa retry tanpa duplikasi enrollment (penting: provider sering kirim notifikasi >1x)
- ✅ **Hybrid payment confirmation** — gabungan polling frontend (UX real-time) + webhook backend (reliability backup)
- ✅ **Production-ready DevOps** — pnpm minimum release age (1-day) sebagai supply-chain guard, automatic SSL renewal, structured JSON logs, PM2 persist on reboot
- ✅ **Monorepo workspace** — shared types antara backend & frontend, build artifacts terpisah per package

---

## Stats Konten

| Item | Jumlah |
|---|---|
| Soal CPNS (TWK + TIU + TKP) | 2.658 |
| Quiz tematik | 17 |
| Materi pembelajaran | 42 |
| Paket bimbingan (multi-segmen) | 5 |
| Durasi akses Paket CPNS Lengkap | 90 hari |

---

## Akses & Demo

🌐 **Live:** [https://lulusin.hemitech.id](https://lulusin.hemitech.id)

Akun demo dapat di-request via Hemitech untuk eksplorasi sebagai admin / tutor / student.

---

## Tertarik dengan Solusi Serupa?

Lulusin dirancang sebagai **template LMS** yang siap di-rebrand untuk:
- Bimbingan belajar (UTBK, USM, sertifikasi profesi)
- Pelatihan internal korporat
- Course marketplace skala UKM-Enterprise

Hubungi tim Hemitech untuk diskusi custom development.

---

*Dikembangkan & dioperasikan oleh [Hemitech](https://hemitech.id/)*
