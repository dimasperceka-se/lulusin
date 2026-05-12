# 🚀 Prompt: Modernize & Enhance E-Learning Platform

Saya sudah punya aplikasi kursus online (CPNS & Bimbel sekolah) yang functional. Sekarang saya mau **upgrade tampilan & user experience-nya jadi modern, premium, dan terasa seperti produk SaaS kelas dunia** (referensi: Linear, Vercel, Notion, Ruangguru, Coursera).

Tolong improve aplikasi saya dengan spesifikasi berikut:

---

## 🎨 BAGIAN 1: Modern UI/UX Overhaul

### Design System
- Pakai **shadcn/ui** sebagai komponen library utama (replace komponen custom yang lama)
- Install **Lucide React** untuk icon yang konsisten
- Typography: **Inter** untuk body, **Cal Sans** atau **Plus Jakarta Sans** untuk heading
- Spacing system: pakai 4px grid (Tailwind default)
- Border radius: konsisten `rounded-xl` (12px) untuk card, `rounded-lg` untuk button
- Shadow: subtle shadow dengan warna primary tint, bukan abu-abu polos

### Color Palette (Modern, Bukan Bootstrap-ish)
```
Primary:    #4F46E5 (indigo-600) atau #0EA5E9 (sky-500)
Secondary:  #F59E0B (amber-500) untuk CTA
Success:    #10B981 (emerald-500)
Danger:     #EF4444 (red-500)
Background: #FAFAFA (light) / #0A0A0A (dark)
Surface:    #FFFFFF / #171717
Border:     #E5E5E5 / #262626
```

### Dark Mode Support ⭐
- Toggle dark/light mode di header (dengan animasi smooth)
- Pakai `next-themes` atau Context custom
- Simpan preference di localStorage
- Support `system` mode (ikut OS user)
- Semua komponen harus look good di kedua mode

### Modern Visual Elements
- **Gradient mesh background** di landing page (subtle, tidak norak)
- **Glassmorphism** untuk navbar (backdrop-blur saat scroll)
- **Bento grid layout** untuk features section di landing
- **Animated gradient text** untuk headline utama
- **Noise texture overlay** subtle untuk depth
- **Soft shadows** dengan colored tint, bukan plain gray

---

## ✨ BAGIAN 2: Micro-interactions & Animations

Pakai **Framer Motion** untuk semua animasi. Implementasikan:

### Page Transitions
- Smooth fade + slight slide saat ganti halaman
- Stagger animation untuk list (card muncul satu-satu, delay 50ms)

### Hover Effects
- Card: lift up 4px + shadow grow + border glow saat hover
- Button: scale 1.02 + shadow lift
- Image: subtle zoom (scale 1.05)
- Link: underline animated dari kiri ke kanan

### Loading States
- **Skeleton screens** (bukan spinner!) untuk semua data loading
- Shimmer effect di skeleton
- Progress bar di top page saat navigation (pakai `nprogress`)
- Optimistic UI updates (tampilkan perubahan dulu sebelum API confirm)

### Feedback Animations
- Success: checkmark animation + confetti untuk milestone (selesai materi, lulus tryout)
- Error: shake animation pada input field
- Toast notifications dengan slide-in dari kanan + auto-dismiss
- Number count-up animation untuk statistik (0 → 1500 students)

### Scroll Animations
- Fade in + slide up untuk section saat masuk viewport (`framer-motion` `whileInView`)
- Parallax subtle untuk hero section
- Progress indicator scroll position di sidebar materi

---

## 🏠 BAGIAN 3: Landing Page Redesign

Bikin landing page yang **jualan banget** tapi tetap classy:

### Hero Section
- **Headline besar** (text-6xl) dengan gradient text
- Animated typing effect untuk subheadline (pakai `react-type-animation`)
- 2 CTA: primary "Mulai Belajar Gratis" + secondary "Lihat Demo"
- Background: animated mesh gradient atau particle effect (subtle)
- **Trust badges**: "5000+ Siswa Aktif", "Tingkat Kelulusan 87%", logo media yang pernah meliput
- Mockup screenshot aplikasi di sebelah kanan dengan tilt effect

### Social Proof Section
- Marquee/auto-scroll testimonial dari siswa (pakai `react-fast-marquee`)
- Counter angka achievement (animated count-up)
- Logo "dipercaya oleh" instansi/sekolah

### Features Showcase
- **Bento grid** asymmetric (referensi: vercel.com, linear.app)
- Setiap fitur punya ilustrasi/animation kecil
- Hover state: card jadi interactive (preview fitur)

### Pricing Section
- 3 kolom dengan **paket tengah highlighted** (border gradient + scale up + badge "PALING POPULER")
- Toggle bulanan/tahunan dengan animasi
- Comparison table di bawah untuk detail

### FAQ Section
- Accordion dengan smooth animation
- Search bar untuk cari pertanyaan
- Group by category

### Footer
- Multi-column dengan link yang relevan
- Newsletter signup
- Social media icons dengan hover effect
- Logo + tagline

---

## 📱 BAGIAN 4: Dashboard Redesign

### Sidebar
- **Collapsible sidebar** (icon-only mode)
- Active state dengan gradient bar di kiri
- Group navigation (Dashboard, Belajar, Tryout, Akun)
- Profile mini di bagian bawah dengan dropdown
- Smooth transition saat expand/collapse

### Top Bar
- **Global search** dengan command palette (Cmd+K, pakai `cmdk` library)
- Notification bell dengan badge unread + dropdown panel
- Quick action menu
- Theme toggle
- Avatar dropdown

### Dashboard Cards (Stats)
- **Animated number** count-up
- Mini chart inline (sparkline pakai `recharts`)
- Trend indicator (↑ 12% from last week dengan warna)
- Hover: tampilkan detail breakdown

### Data Tables
- Pakai `@tanstack/react-table` untuk sorting/filtering
- Sticky header
- Row hover dengan highlight subtle
- Inline actions (edit, delete) muncul saat hover row
- Empty state yang menarik (illustration + CTA)
- Skeleton loading per row

### Charts (Recharts)
- Area chart dengan gradient fill (bukan flat color)
- Tooltip custom yang cantik
- Animation saat data load
- Responsive di mobile

---

## 🎓 BAGIAN 5: Learning Experience Upgrade

### PDF Viewer (Modern)
- Pakai `react-pdf` dengan custom controls
- Sidebar daftar isi (table of contents)
- Bookmark/highlight feature (saved per user)
- Note-taking di samping PDF
- Reading progress bar di atas
- Dark mode untuk PDF reader
- Zoom controls + fullscreen mode

### CBT Tryout Experience
- **Distraction-free fullscreen mode**
- Question palette di sebelah kanan dengan color coding (answered/flagged/empty)
- **Sticky timer** dengan warning color saat <10 menit
- Smooth transition antar soal (slide animation)
- Confirmation modal saat submit
- **Result page dengan dramatic reveal**: 
  - Score animation count-up
  - Confetti jika passing
  - Breakdown chart (radar chart per kategori)
  - Comparison vs rata-rata peserta lain
  - Share button (download as image untuk Instagram story)

### Quiz Interactive
- Card swipe animation antar soal
- Instant feedback (green flash benar, red shake salah)
- Streak counter (jawab benar berturut-turut)
- Confetti saat dapat skor sempurna
- Audio feedback (toggle on/off)

### Progress Tracking
- **Heatmap calendar** (kayak GitHub contribution graph) untuk konsistensi belajar
- Skill radar chart (TWK/TIU/TKP atau per mapel)
- Achievement badges (gamification: "Konsisten 7 Hari", "Master TIU", dll)
- Leaderboard mingguan dengan animasi rank change

---

## 🎮 BAGIAN 6: Gamification (User Engagement)

- **XP & Level System**: dapat XP dari belajar, naik level
- **Streak system**: hari berturut-turut belajar (kayak Duolingo)
- **Badges & Achievements**: koleksi badge dengan rarity (common, rare, epic, legendary)
- **Daily Challenge**: 5 soal random tiap hari, bonus XP kalau selesai
- **Leaderboard**: weekly/monthly/all-time
- **Reward shop**: tukar poin dengan e-book gratis, diskon paket, dll
- Progress bar yang **psychologically rewarding** (filling animation, milestone celebrations)

---

## 💳 BAGIAN 7: Payment Flow Modernization

### Halaman Pembayaran
- **Multi-step checkout** dengan progress indicator
- Step 1: Review pesanan (dengan summary card cantik)
- Step 2: Pilih bank tujuan (card selection dengan logo bank)
- Step 3: Halaman instruksi pembayaran:
  - **Copy button** untuk nomor rekening & nominal
  - QR code untuk transfer (kalau bank support)
  - Countdown timer besar dengan animasi
  - Tutorial transfer per bank (collapsible)
- Step 4: Upload bukti dengan drag-and-drop zone

### Status Tracking
- Timeline visual (kayak tracking pesanan e-commerce)
- Real-time status update (poll API tiap 30 detik)
- Confetti animation saat pembayaran approved
- Email notification yang well-designed (HTML email)

---

## 🔍 BAGIAN 8: Search & Discovery

### Global Command Palette (Cmd+K)
- Pakai `cmdk` library
- Quick navigation ke halaman
- Search materi, soal, paket
- Recent searches
- Keyboard shortcuts visible

### Smart Search
- Search dengan debounce
- Highlight matching keyword di hasil
- Filter facet (kategori, harga, durasi)
- Empty state dengan suggestion

---

## 📱 BAGIAN 9: Mobile-First Refinement

- Pastikan **semua halaman responsive** sempurna
- Bottom navigation bar untuk mobile (5 tab utama)
- Swipe gestures (swipe untuk next/prev soal)
- Pull-to-refresh di halaman list
- Touch-friendly button sizes (min 44x44px)
- **PWA support**: bisa di-install ke home screen, offline mode untuk materi yang sudah di-cache

---

## ⚡ BAGIAN 10: Performance & Polish

### Performance
- Lazy load images dengan blur placeholder (`next/image` style)
- Code splitting per route
- Virtualized list untuk data panjang (`react-window`)
- Debounce search input
- Cache API response (React Query / TanStack Query)
- Optimize bundle size (analyze dengan `vite-bundle-visualizer`)

### Polish Details
- **Empty states** yang menarik (illustration + helpful copy + CTA)
- **Error states** yang informatif (bukan cuma "Error 500")
- **404 page** kreatif
- **Onboarding tour** untuk first-time user (pakai `react-joyride`)
- **Tooltips** di icon yang ambigu
- **Keyboard shortcuts** untuk power users (dengan modal shortcut helper)

---

## 🎁 BAGIAN 11: Bonus Features (Wow Factor)

### AI-Powered Features
- **Smart recommendations**: "Berdasarkan skor Anda, fokus belajar topik X"
- **Auto-generated study plan**: AI bikin jadwal belajar berdasarkan target ujian
- **Question similarity check** (untuk admin): cegah soal duplikat saat input

### Social Features
- **Study group**: chat room per paket
- **Share progress** ke social media (auto-generate image cantik)
- **Refer & earn**: kasih kode referral, dapat diskon kalau ada yang daftar

### Notifications
- In-app notification center
- Push notification (PWA)
- Reminder belajar harian (custom waktu)
- Notif tryout berjadwal H-1

---

## 🛠️ Tech Stack Tambahan yang Perlu Diinstall

```bash
# UI & Animation
npm install framer-motion lucide-react cmdk
npm install @radix-ui/react-* (untuk shadcn)
npm install class-variance-authority clsx tailwind-merge

# Charts & Data Viz
npm install recharts react-circular-progressbar

# UX Enhancement
npm install react-hot-toast sonner
npm install react-joyride react-type-animation
npm install react-fast-marquee canvas-confetti
npm install nprogress

# Forms & Tables
npm install react-hook-form zod @hookform/resolvers
npm install @tanstack/react-table @tanstack/react-query

# Theme
npm install next-themes
```

---

## ✅ Acceptance Criteria

Aplikasi dianggap "modern" kalau:

1. ✨ Setiap interaksi punya feedback visual (animation/transition)
2. 🌓 Dark mode bekerja sempurna di semua halaman
3. 📱 Responsive 100% di mobile (test di iPhone SE size)
4. ⚡ Lighthouse score >90 (Performance, Accessibility, Best Practices)
5. 🎨 Design konsisten (spacing, color, typography sesuai design system)
6. 🚀 Tidak ada loading state yang "blank" — selalu pakai skeleton
7. 🎭 Empty states & error states tidak generic
8. ⌨️ Keyboard navigation berfungsi (Tab, Esc, arrow keys)
9. 🎯 Micro-interactions terasa di setiap click
10. 💎 Kalau di-screenshot, layak dipasang di Dribbble/Behance

---

## 📐 Prioritas Pengerjaan

Kerjakan dengan urutan ini biar impact terlihat cepat:

**Phase 1 (Quick Win - 1-2 hari):**
1. Install shadcn/ui + Lucide icons
2. Update color palette & typography
3. Tambah dark mode toggle
4. Skeleton loading di semua page
5. Toast notification yang cantik (sonner)

**Phase 2 (High Impact - 3-5 hari):**
6. Landing page redesign full
7. Dashboard sidebar collapsible + top bar dengan command palette
8. Framer motion untuk page transitions
9. CBT tryout experience overhaul
10. Modern data tables

**Phase 3 (Polish - 1 minggu):**
11. Gamification system (XP, badge, streak)
12. Charts dengan recharts custom
13. PWA setup
14. Onboarding tour
15. AI recommendations (kalau mau)

---

**Catatan Penting:**
- Jaga **backward compatibility** — jangan rusak fitur yang sudah ada
- Test di mobile setelah setiap perubahan UI
- Pakai **componentization** — bikin reusable component (Button, Card, Input, dll)
- Konsisten dengan **naming convention** yang sudah ada
- Tambahkan **storybook** kalau memungkinkan, untuk dokumentasi komponen

Tolong kerjakan **Phase 1 dulu** dan tunjukkan hasilnya, baru kita lanjut ke phase berikutnya.
