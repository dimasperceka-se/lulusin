import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "id" | "en";

const translations = {
  id: {
    // Navbar
    nav: {
      features: "Fitur",
      pricing: "Harga",
      community: "Komunitas",
      download: "Download",
      login: "Login",
      startFree: "Mulai Gratis",
    },
    // Hero
    hero: {
      badge: "Storify Insights",
      title1: "Dengarkan Ribuan Buku,",
      title2: "Kapan Saja & Di Mana Saja",
      subtitle:
        "Storify menghadirkan ratusan audiobook dan cerita audio pilihan dalam satu aplikasi. Belajar dan terhibur sambil kamu beraktivitas.",
      ctaPrimary: "Coba Sekarang",
      ctaSecondary: "Download Android",
      statTitles: "Judul Tersedia",
      statRating: "Rating 4.8★",
      statListeners: "Pendengar Aktif",
    },
    // Social Proof
    social: {
      trusted: "Dipercaya oleh 50.000+ pendengar di Indonesia",
      categories: ["Fiksi", "Non-fiksi", "Novel", "Motivasi", "Pengembangan Diri", "Dan lainnya"],
    },
    // How It Works
    howItWorks: {
      badge: "CARA KERJA",
      title: "Tiga Langkah Mudah",
      subtitle:
        "Tiga langkah sederhana untuk mulai perjalanan belajar audiomu dan mengembangkan diri setiap hari.",
      steps: [
        {
          title: "Temukan",
          desc: "Jelajahi ratusan judul audiobook & cerita pilihan dari berbagai kategori favorit kamu.",
        },
        {
          title: "Dengarkan",
          desc: "Putar kapan saja, lanjutkan dari posisi terakhir. Progress kamu tersimpan otomatis di semua perangkat.",
        },
        {
          title: "Berkembang",
          desc: "Tambah wawasan dan ilmu baru sambil tetap produktif. Belajar sambil beraktivitas sehari-hari.",
        },
      ],
    },
    // Features
    features: {
      badge: "FITUR UNGGULAN",
      title: "Semua yang Kamu Butuhkan",
      subtitle:
        "Pengalaman audiobook yang lengkap, modern, dan terjangkau dengan teknologi terdepan.",
      items: [
        {
          title: "Ribuan Judul Audio",
          desc: "Koleksi audiobook & cerita dari berbagai kategori. Fiksi, non-fiksi, novel, motivasi, pengembangan diri, dan masih banyak lagi.",
        },
        {
          title: "Resume Playback",
          desc: "Lanjutkan dari titik terakhir, bahkan setelah ganti perangkat. Progress kamu tersimpan otomatis di cloud.",
        },
        {
          title: "Background Play",
          desc: "Tetap diputar saat layar terkunci. Kontrol lewat notifikasi Android dengan mudah tanpa perlu membuka aplikasi.",
        },
        {
          title: "PDF Bawaan",
          desc: "Baca teks sambil mendengarkan audio. Pengalaman belajar yang lebih mendalam dan efektif.",
        },
        {
          title: "Multi-Platform",
          desc: "Tersedia di web browser, Android app, dan PWA. Satu akun, semua perangkat, pengalaman yang seamless.",
        },
        {
          title: "Program Referral",
          desc: "Bagikan kode unikmu, teman dapatkan diskon 10%, kamu dapat komisi 5% dari setiap transaksi mereka.",
        },
      ],
    },
    // Pricing
    pricing: {
      badge: "HARGA",
      title: "Harga Terjangkau, Akses Tak Terbatas",
      subtitle:
        "Pilih paket yang sesuai dengan kebutuhan dan budget kamu. Semua paket dapat dibatalkan kapan saja.",
      paymentNote: "Bayar dengan QRIS, Transfer Bank, GoPay, OVO, DANA, dan banyak lagi",
      cta: "Bayar dengan QRIS",
      loginNote: "Masuk atau daftar terlebih dahulu sebelum berlangganan",
      plans: [
        {
          name: "Mingguan",
          badge: "",
          price: "Rp 15.000",
          period: "/minggu",
          desc: "7 hari",
          dailyPrice: "Rp 2.143/hari",
          features: [
            "Unlimited audiobook",
            "Akses semua kategori",
            "Continue listening",
          ],
        },
        {
          name: "Bulanan",
          badge: "BEST VALUE",
          price: "Rp 49.000",
          period: "/bulan",
          desc: "30 hari",
          dailyPrice: "Rp 1.633/hari",
          features: [
            "Unlimited audiobook",
            "Akses semua kategori",
            "Continue listening",
          ],
          highlighted: true,
        },
        {
          name: "Tahunan",
          badge: "",
          price: "Rp 399.000",
          period: "/tahun",
          desc: "365 hari",
          dailyPrice: "Rp 1.093/hari",
          features: [
            "Unlimited audiobook",
            "Akses semua kategori",
            "Continue listening",
          ],
        },
      ],
    },
    // Waitlist
    waitlist: {
      badge: "Yang Akan Datang",
      title: "Fitur Revolusioner\nSegera Hadir",
      subtitle:
        "Kami sedang mengembangkan Upload Buku Sendiri yang memungkinkan kamu mengunggah file PDF pribadi, dan AI Audio Summary yang otomatis menghasilkan ringkasan audio dari buku apapun.",
      uploadTitle: "Upload Buku",
      uploadDesc: "Koleksimu, caramu.",
      aiTitle: "AI Summary",
      aiDesc: "Teknologi generasi berikutnya.",
      formTitle: "Jadilah yang Pertama",
      formSubtitle:
        "Daftar email Anda untuk mendapat akses awal ke fitur baru. Kuota terbatas untuk 500 pendaftar pertama!",
      placeholder: "Masukkan email Anda...",
      submit: "Daftar Waitlist",
      submitting: "Mendaftar...",
      noSpam: "Kami tidak akan pernah mengirimkan spam.",
    },
    // Donation
    donation: {
      title: "Setiap Langganan, Sebuah Kepedulian",
      body: "Kami percaya bahwa bisnis yang baik harus memberi dampak yang baik pula. Itulah mengapa",
      highlight: "10% dari setiap keuntungan Storify",
      body2: "disumbangkan untuk mendukung rakyat Palestina melalui lembaga kemanusiaan terpercaya.",
      note: "Dengan berlangganan Storify, kamu tidak hanya berinvestasi untuk dirimu sendiri — kamu juga turut berkontribusi nyata bagi mereka yang membutuhkan.",
      cta: "Mulai Berlangganan Sekarang",
      transparency: "Storify berkomitmen transparan dalam pelaporan donasi",
    },
    // Testimonials
    testimonials: {
      badge: "TESTIMONI",
      title: "Apa Kata Mereka?",
      subtitle: "Ribuan pendengar telah merasakan manfaatnya dan terus bertambah setiap hari.",
      items: [
        {
          name: "Adi",
          role: "Mahasiswa",
          content:
            "Akhirnya bisa 'baca' buku lagi! Saya dengarkan Storify setiap pagi saat olahraga. Sudah selesai 5 buku dalam sebulan!",
          initials: "A",
          color: "from-blue-500 to-blue-600",
        },
        {
          name: "Citra",
          role: "Ibu Rumah Tangga",
          content:
            "Sebagai ibu rumah tangga, saya tidak punya waktu duduk baca. Storify adalah solusinya. Sambil masak, sambil belajar!",
          initials: "C",
          color: "from-rose-500 to-rose-600",
        },
        {
          name: "Budi",
          role: "Profesional",
          content:
            "Kontennya lengkap dan terus bertambah. Plus tahu ada donasi ke Palestina, makin mantap langganan!",
          initials: "B",
          color: "from-purple-500 to-purple-600",
        },
        {
          name: "Rina",
          role: "Mahasiswa",
          content: "UI-nya bersih, gampang dipakai, dan audio-nya jernih. Worth it banget!",
          initials: "R",
          color: "from-emerald-500 to-emerald-600",
        },
      ],
    },
    // FAQ
    faq: {
      badge: "FAQ",
      title: "Pertanyaan Populer",
      subtitle: "Jawaban cepat untuk keraguan kamu tentang Storify.",
      items: [
        {
          q: "Apakah ada konten gratis?",
          a: "Ya, beberapa konten dapat dicoba sebelum berlangganan. Kami menyediakan preview dan sample gratis untuk semua judul.",
        },
        {
          q: "Bagaimana cara berlangganan?",
          a: "Daftar akun → pilih paket → bayar dengan metode pembayaran favorit kamu (QRIS, Transfer, e-wallet, dll). Akses langsung setelah pembayaran.",
        },
        {
          q: "Apakah bisa digunakan di iPhone?",
          a: "Saat ini tersedia di web dan Android. Versi iOS segera hadir dalam beberapa bulan ke depan. Daftar notifikasi untuk mendapat update.",
        },
        {
          q: "Bagaimana sistem referral bekerja?",
          a: "Kamu mendapat kode unik setelah daftar. Teman yang pakai kodenya dapat diskon 10%, kamu dapat komisi 5% dari setiap transaksi mereka.",
        },
        {
          q: "Ke mana donasi Palestina disalurkan?",
          a: "Melalui lembaga kemanusiaan terpercaya yang telah terverifikasi. Laporan donasi akan kami publikasikan secara transparan setiap bulannya.",
        },
      ],
    },
    // Showcase 1 — Browse
    showcase1: {
      badge: "JELAJAHI KOLEKSI",
      title: "Temukan Buku Favoritmu dengan Mudah",
      desc: "Storify menyediakan antarmuka pencarian yang intuitif dengan kategori lengkap. Cukup ketik judul, penulis, atau kata kunci — dan temukan audiobook yang kamu cari dalam hitungan detik.",
      points: [
        "Cari berdasarkan judul, penulis, atau kata kunci",
        "Filter berdasarkan 12+ kategori: Business, Psychology, Technology, dan lainnya",
        "Tampilan cover buku yang menarik dengan durasi audio yang jelas",
      ],
    },
    // Showcase 2 — Listen
    showcase2: {
      badge: "DENGARKAN KAPAN SAJA",
      title: "Ringkasan Buku Terbaik dalam Genggamanmu",
      desc: "Nikmati ringkasan audiobook berkualitas tinggi langsung dari smartphone. Dengarkan buku terlaris dunia seperti Atomic Habits, Emotional Intelligence, dan ratusan judul lainnya — sambil ngopi, commuting, atau bersantai.",
      points: [
        "Pilihan utama yang dikurasi oleh tim editorial Storify",
        "Audio berkualitas tinggi dengan durasi ringkas 3-15 menit per buku",
        "Lanjutkan dari posisi terakhir kapan pun kamu kembali",
      ],
    },
    // Showcase 3 — Multi-platform
    showcase3: {
      badge: "MULTI-PLATFORM",
      title: "Satu Akun, Semua Perangkat",
      desc: "Storify dirancang untuk gaya hidupmu yang dinamis. Baca dan dengarkan di smartphone, tablet, atau laptop — progress-mu tetap tersinkronisasi di semua perangkat.",
      tags: ["Smartphone", "Tablet", "Laptop", "Web Browser", "Android App", "PWA"],
    },
    // CTA
    cta: {
      badge: "Mulai Sekarang",
      title: "Siap Mulai Perjalanan Belajarmu?",
      subtitle:
        "Bergabunglah dengan 50.000+ pendengar aktif Storify hari ini. Dapatkan akses ke ratusan audiobook premium dan cerita audio terbaik Indonesia.",
      ctaBrowser: "Buka di Browser",
      ctaAndroid: "Download Android",
    },
    // Footer
    footer: {
      tagline: "Platform audiobook dan cerita audio #1 Indonesia. Baca dengan telinga, raih ilmu tanpa batas.",
      product: "Produk",
      company: "Perusahaan",
      legal: "Legal",
      productLinks: ["Fitur", "Harga", "Download", "Roadmap"],
      companyLinks: ["Tentang", "Blog", "Karir", "Kontak"],
      legalLinks: ["Kebijakan Privasi", "Syarat & Ketentuan", "Lisensi"],
      copyright: "© 2025 Storify by Intesa Global · Semua hak dilindungi · 🍉 10% keuntungan untuk Palestina",
    },
    // Toast
    toast: {
      successTitle: "Berhasil bergabung!",
      successDesc: "Kami akan menghubungi Anda saat fitur baru dirilis.",
      errorTitle: "Gagal",
      errorDesc: "Terdapat kesalahan. Coba lagi.",
    },
  },
  en: {
    nav: {
      features: "Features",
      pricing: "Pricing",
      community: "Community",
      download: "Download",
      login: "Login",
      startFree: "Start Free",
    },
    hero: {
      badge: "Storify Insights",
      title1: "Listen to Thousands of Books,",
      title2: "Anytime & Anywhere",
      subtitle:
        "Storify brings hundreds of curated audiobooks and audio stories in one app. Learn and be entertained while going about your day.",
      ctaPrimary: "Try Now",
      ctaSecondary: "Download Android",
      statTitles: "Titles Available",
      statRating: "Rating 4.8★",
      statListeners: "Active Listeners",
    },
    social: {
      trusted: "Trusted by 50,000+ listeners across Indonesia",
      categories: ["Fiction", "Non-fiction", "Novel", "Motivation", "Self Development", "And more"],
    },
    howItWorks: {
      badge: "HOW IT WORKS",
      title: "Three Simple Steps",
      subtitle:
        "Three easy steps to start your audio learning journey and grow yourself every day.",
      steps: [
        {
          title: "Discover",
          desc: "Browse hundreds of audiobook titles & curated stories from your favorite categories.",
        },
        {
          title: "Listen",
          desc: "Play anytime, resume from where you left off. Your progress is auto-saved across all devices.",
        },
        {
          title: "Grow",
          desc: "Gain new knowledge and insights while staying productive. Learn while going about your day.",
        },
      ],
    },
    features: {
      badge: "KEY FEATURES",
      title: "Everything You Need",
      subtitle:
        "A complete, modern, and affordable audiobook experience powered by cutting-edge technology.",
      items: [
        {
          title: "Thousands of Audio Titles",
          desc: "Audiobook & story collection across all categories. Fiction, non-fiction, novels, motivation, self-development, and much more.",
        },
        {
          title: "Resume Playback",
          desc: "Continue from where you left off, even after switching devices. Your progress is automatically saved in the cloud.",
        },
        {
          title: "Background Play",
          desc: "Keeps playing when the screen is locked. Control via Android notifications without opening the app.",
        },
        {
          title: "Built-in PDF",
          desc: "Read along while listening to the audio. A deeper and more effective learning experience.",
        },
        {
          title: "Multi-Platform",
          desc: "Available on web browser, Android app, and PWA. One account, all devices, seamless experience.",
        },
        {
          title: "Referral Program",
          desc: "Share your unique code, friends get 10% off, and you earn 5% commission from every transaction.",
        },
      ],
    },
    pricing: {
      badge: "PRICING",
      title: "Affordable Price, Unlimited Access",
      subtitle:
        "Choose the plan that suits your needs and budget. All plans can be cancelled anytime.",
      paymentNote: "Pay with QRIS, Bank Transfer, GoPay, OVO, DANA, and more",
      cta: "Pay with QRIS",
      loginNote: "Please sign in or register first before subscribing",
      plans: [
        {
          name: "Weekly",
          badge: "",
          price: "Rp 15,000",
          period: "/week",
          desc: "7 days",
          dailyPrice: "Rp 2,143/day",
          features: [
            "Unlimited audiobook",
            "Access all categories",
            "Continue listening",
          ],
        },
        {
          name: "Monthly",
          badge: "BEST VALUE",
          price: "Rp 49,000",
          period: "/month",
          desc: "30 days",
          dailyPrice: "Rp 1,633/day",
          features: [
            "Unlimited audiobook",
            "Access all categories",
            "Continue listening",
          ],
          highlighted: true,
        },
        {
          name: "Yearly",
          badge: "",
          price: "Rp 399,000",
          period: "/year",
          desc: "365 days",
          dailyPrice: "Rp 1,093/day",
          features: [
            "Unlimited audiobook",
            "Access all categories",
            "Continue listening",
          ],
        },
      ],
    },
    waitlist: {
      badge: "Coming Soon",
      title: "Revolutionary Features\nComing Soon",
      subtitle:
        "We are developing Upload Your Own Book that lets you upload your personal PDF files, and AI Audio Summary that automatically generates audio summaries from any book.",
      uploadTitle: "Upload Books",
      uploadDesc: "Your collection, your way.",
      aiTitle: "AI Summary",
      aiDesc: "Next-generation technology.",
      formTitle: "Be the First",
      formSubtitle:
        "Register your email to get early access to new features. Limited to the first 500 registrants!",
      placeholder: "Enter your email...",
      submit: "Join Waitlist",
      submitting: "Registering...",
      noSpam: "We will never send you spam.",
    },
    donation: {
      title: "Every Subscription, A Cause",
      body: "We believe that good business must create good impact. That's why",
      highlight: "10% of every Storify profit",
      body2: "is donated to support the people of Palestine through trusted humanitarian organizations.",
      note: "By subscribing to Storify, you're not only investing in yourself — you're also making a real contribution to those in need.",
      cta: "Start Subscribing Now",
      transparency: "Storify is committed to transparent donation reporting",
    },
    testimonials: {
      badge: "TESTIMONIALS",
      title: "What They Say",
      subtitle: "Thousands of listeners have felt the benefits and more join every day.",
      items: [
        {
          name: "Adi",
          role: "Student",
          content:
            "I can 'read' books again! I listen to Storify every morning while exercising. I've finished 5 books in a month!",
          initials: "A",
          color: "from-blue-500 to-blue-600",
        },
        {
          name: "Citra",
          role: "Homemaker",
          content:
            "As a homemaker, I don't have time to sit and read. Storify is the solution. Cook and learn at the same time!",
          initials: "C",
          color: "from-rose-500 to-rose-600",
        },
        {
          name: "Budi",
          role: "Professional",
          content:
            "The content is comprehensive and keeps growing. Plus knowing there's a Palestine donation, I'm even more confident subscribing!",
          initials: "B",
          color: "from-purple-500 to-purple-600",
        },
        {
          name: "Rina",
          role: "Student",
          content: "Clean UI, easy to use, and clear audio. Totally worth it!",
          initials: "R",
          color: "from-emerald-500 to-emerald-600",
        },
      ],
    },
    faq: {
      badge: "FAQ",
      title: "Common Questions",
      subtitle: "Quick answers to your questions about Storify.",
      items: [
        {
          q: "Is there any free content?",
          a: "Yes, some content can be tried before subscribing. We provide free previews and samples for all titles.",
        },
        {
          q: "How do I subscribe?",
          a: "Register an account → choose a plan → pay with your preferred payment method (QRIS, Transfer, e-wallet, etc.). Access immediately after payment.",
        },
        {
          q: "Can it be used on iPhone?",
          a: "Currently available on web and Android. iOS version is coming soon in the next few months. Sign up for notifications to get updates.",
        },
        {
          q: "How does the referral system work?",
          a: "You get a unique code after registering. Friends who use your code get 10% off, and you earn 5% commission from every transaction.",
        },
        {
          q: "Where do the Palestine donations go?",
          a: "Through verified and trusted humanitarian organizations. Donation reports will be published transparently every month.",
        },
      ],
    },
    showcase1: {
      badge: "BROWSE COLLECTION",
      title: "Find Your Favorite Books Easily",
      desc: "Storify provides an intuitive search interface with comprehensive categories. Just type a title, author, or keyword — and find the audiobook you're looking for in seconds.",
      points: [
        "Search by title, author, or keyword",
        "Filter by 12+ categories: Business, Psychology, Technology, and more",
        "Attractive book cover display with clear audio duration",
      ],
    },
    showcase2: {
      badge: "LISTEN ANYTIME",
      title: "Best Book Summaries in Your Hands",
      desc: "Enjoy high-quality audiobook summaries straight from your smartphone. Listen to world bestsellers like Atomic Habits, Emotional Intelligence, and hundreds more — while having coffee, commuting, or relaxing.",
      points: [
        "Top picks curated by the Storify editorial team",
        "High-quality audio with concise 3-15 minute summaries per book",
        "Resume from where you left off whenever you return",
      ],
    },
    showcase3: {
      badge: "MULTI-PLATFORM",
      title: "One Account, All Devices",
      desc: "Storify is designed for your dynamic lifestyle. Read and listen on smartphone, tablet, or laptop — your progress stays synced across all devices.",
      tags: ["Smartphone", "Tablet", "Laptop", "Web Browser", "Android App", "PWA"],
    },
    cta: {
      badge: "Start Now",
      title: "Ready to Start Your Learning Journey?",
      subtitle:
        "Join 50,000+ active Storify listeners today. Get access to hundreds of premium audiobooks and the best Indonesian audio stories.",
      ctaBrowser: "Open in Browser",
      ctaAndroid: "Download Android",
    },
    footer: {
      tagline: "Indonesia's #1 audiobook and audio story platform. Learn with your ears, gain knowledge without limits.",
      product: "Product",
      company: "Company",
      legal: "Legal",
      productLinks: ["Features", "Pricing", "Download", "Roadmap"],
      companyLinks: ["About", "Blog", "Careers", "Contact"],
      legalLinks: ["Privacy Policy", "Terms & Conditions", "License"],
      copyright: "© 2025 Storify by Intesa Global · All rights reserved · 🍉 10% profit for Palestine",
    },
    toast: {
      successTitle: "Successfully joined!",
      successDesc: "We'll contact you when new features are released.",
      errorTitle: "Failed",
      errorDesc: "Something went wrong. Please try again.",
    },
  },
} as const;

export type Translations = typeof translations.id;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");
  const t = translations[lang] as Translations;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
