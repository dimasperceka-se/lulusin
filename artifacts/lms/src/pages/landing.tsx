import { useState } from "react";
import { Link } from "wouter";
import { useListPackages } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatPriceOrFree } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Search,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  Trophy,
  BarChart3,
  GraduationCap,
  Zap,
  ShieldCheck,
  Star,
  Handshake,
  Wallet,
  Users,
  LineChart,
  Gift,
  Quote,
} from "lucide-react";
import heroPhoto from "@assets/foto_bertiga-removebg-preview.png";
import logoUrl from "@assets/logo.png";
import pnsAlumni from "@assets/pns_1.png";
import jondesCard from "@assets/testimoni/jondes_3.png";
import telaCard from "@assets/testimoni/tela_1.png";
import enongCard from "@assets/testimoni/enong_1.png";
import sindamiCard from "@assets/testimoni/sindami.png";
import fahmiCard from "@assets/testimoni/fahmi_1.png";

const TESTIMONI_CARDS: { src: string; alt: string }[] = [
  { src: jondesCard, alt: "Testimoni Jonathan de Santo — PNS KLH/BPLH" },
  { src: telaCard, alt: "Testimoni Tiara Wulan — PNS Dinas Pertanian Jawa Barat" },
  { src: enongCard, alt: "Testimoni Muhammad Rangga Prayoga — PNS Kemenkumham" },
  { src: sindamiCard, alt: "Testimoni Asih Indah Utami — PNS Kementerian Pertanian" },
  { src: fahmiCard, alt: "Testimoni Fahmi — Dosen Universitas Trunojoyo Madura" },
];
import { RobotMascot } from "@/components/robot-mascot";
import { FlowingRibbons } from "@/components/background-decorations";
import { motion } from "framer-motion";

export default function Landing() {
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: packagesData, isLoading } = useListPackages({
    category: category || undefined,
    search: search || undefined,
    isActive: true,
  });

  const categories = [
    { id: "", label: "Semua" },
    { id: "CPNS", label: "CPNS & PPPK" },
    { id: "SMA", label: "SMA / UTBK" },
    { id: "SMP", label: "SMP" },
    { id: "SD", label: "SD" },
  ];

  const stats = [
    { value: "10rb+", label: "Siswa Aktif" },
    { value: "87%", label: "Tingkat Kelulusan" },
    { value: "500+", label: "Soal Pilihan" },
    { value: "24/7", label: "Akses Belajar" },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      {/* Page-wide flowing ribbons background */}
      <FlowingRibbons />

      <div className="relative z-10">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-[0.04] pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative container mx-auto max-w-6xl px-4 pt-14 pb-16 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: copy */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Platform belajar #1 untuk CPNS & sekolah</span>
              </Badge>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 text-balance">
                Lulus Tes Impianmu
                <span className="block text-gradient">Bersama Lulusin</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8">
                Belajar intensif untuk persiapan CPNS, UTBK, dan ujian sekolah.
                Sistem CBT realistis, materi terstruktur, dan analisis hasil yang mendalam.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                <Button size="lg" className="font-semibold shadow-glow text-base h-12 px-7" asChild>
                  <Link href="/register">
                    Mulai Belajar Gratis <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="font-semibold text-base h-12 px-7" asChild>
                  <a href="#packages">Lihat Paket Belajar</a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="flex">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <span><strong className="text-foreground">4.9/5</strong> rating</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span><strong className="text-foreground">10rb+</strong> siswa aktif</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-accent" />
                  <span><strong className="text-foreground">87%</strong> kelulusan</span>
                </div>
              </div>
            </div>

            {/* Right: hero photo */}
            <div className="relative mx-auto lg:mx-0 max-w-md lg:max-w-none w-full">
              <div className="absolute inset-0 -z-10 bg-mesh opacity-90 blur-3xl scale-90" />
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
              <div className="absolute -bottom-6 -right-6 h-40 w-40 rounded-full bg-secondary/40 blur-3xl" />

              {/* Floating badges */}
              <div className="hidden md:flex absolute top-4 -left-2 lg:-left-6 z-10 items-center gap-2 rounded-2xl border border-card-border bg-card/80 backdrop-blur px-3 py-2 shadow-card">
                <span className="grid place-items-center h-9 w-9 rounded-xl bg-success/10 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-muted-foreground">Tryout selesai</div>
                  <div className="font-display font-bold text-sm">Skor 412</div>
                </div>
              </div>

              <div className="hidden md:flex absolute bottom-10 -right-2 lg:-right-6 z-10 items-center gap-2 rounded-2xl border border-card-border bg-card/80 backdrop-blur px-3 py-2 shadow-card">
                <span className="grid place-items-center h-9 w-9 rounded-xl bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </span>
                <div className="leading-tight">
                  <div className="text-xs text-muted-foreground">Lulus CPNS</div>
                  <div className="font-display font-bold text-sm">Kemenkes 2026</div>
                </div>
              </div>

              <img
                src={heroPhoto}
                alt="Siswa Lulusin yang berhasil"
                className="relative w-full h-auto object-contain max-h-[520px] mx-auto"
              />
            </div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-12 md:mt-16">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-card-border bg-card/60 backdrop-blur p-4 md:p-5 shadow-soft text-center"
              >
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">{s.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral Program — Prominent Partner CTA */}
      <section id="referral" className="relative py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute top-1/2 -translate-y-1/2 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-6xl relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/95 to-accent text-primary-foreground p-8 md:p-14 shadow-lift"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-accent/40 blur-3xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.08] pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, transparent 0, transparent 18px, rgba(255,255,255,0.5) 18px, rgba(255,255,255,0.5) 19px)",
              }}
            />

            <div className="relative grid md:grid-cols-5 gap-8 md:gap-10 items-center">
              <div className="md:col-span-3 space-y-5">
                <Badge className="bg-white/20 text-white hover:bg-white/25 border border-white/20 backdrop-blur rounded-full">
                  <Handshake className="h-3.5 w-3.5 mr-1.5" />
                  Program Mitra Lulusin
                </Badge>
                <h2 className="font-display text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight">
                  Ajak teman belajar,<br />
                  <span className="text-white/95">dapatkan komisi 20%</span>
                </h2>
                <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-xl">
                  Bagikan kode referalmu — setiap orang yang daftar lewat kode-mu, kamu dapat komisi 20% dari setiap transaksi. Mereka pun dapat diskon 10%. Cuan dari berbagi ilmu.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link href="/form-referal">
                    <Button size="lg" variant="secondary" className="rounded-full shadow-glow text-base font-semibold h-12 px-6 bg-white text-primary hover:bg-white/90">
                      <Handshake className="mr-2 h-4 w-4" />
                      Daftar Sebagai Partner
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/dashboard-referal-holder">
                    <Button size="lg" variant="outline" className="rounded-full text-base h-12 px-6 bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                      Sudah Jadi Partner? Login
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-4 text-center">
                  <Wallet className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="font-display text-2xl md:text-3xl font-bold">20%</div>
                  <div className="text-[11px] text-white/80 mt-1 leading-tight">Komisi per transaksi</div>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="font-display text-2xl md:text-3xl font-bold">10%</div>
                  <div className="text-[11px] text-white/80 mt-1 leading-tight">Diskon untuk teman</div>
                </div>
                <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 p-4 text-center">
                  <LineChart className="h-6 w-6 mx-auto mb-2 text-white" />
                  <div className="font-display text-base md:text-lg font-bold leading-tight mt-1">Real-time</div>
                  <div className="text-[11px] text-white/80 mt-1 leading-tight">Dashboard transparan</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pre-Test Mascot CTA */}
      <RobotMascot />

      {/* Features - redesigned */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-20 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 -right-32 w-96 h-96 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Kenapa Lulusin</span>
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              Disiapkan bareng yang <span className="text-gradient">udah berhasil</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
              Ribuan alumni Lulusin sudah lolos SKD dan bekerja sebagai ASN. Berikut alat lengkap yang membantu mereka.
            </p>
          </div>

          {/* Hero strip: PNS alumni photo + stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="relative grid md:grid-cols-[1fr_1.3fr] gap-6 md:gap-10 items-center mb-6 rounded-3xl bg-gradient-to-br from-primary/15 via-accent/10 to-background border border-primary/20 p-6 md:p-10 overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

            {/* PNS image */}
            <div className="relative flex justify-center md:justify-start order-2 md:order-1">
              <motion.div
                className="relative"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={pnsAlumni}
                  alt="Alumni PNS Lulusin"
                  className="relative h-64 md:h-80 lg:h-96 w-auto object-contain drop-shadow-2xl select-none"
                  draggable={false}
                />
                {/* Floating badges around */}
                <motion.div
                  className="absolute top-8 -right-2 md:-right-6 bg-white shadow-lift rounded-2xl px-3 py-2 flex items-center gap-2 border border-card-border"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="h-8 w-8 rounded-full bg-success/15 grid place-items-center text-success">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground leading-none">Status</p>
                    <p className="text-xs font-bold leading-tight">Lulus CPNS</p>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute bottom-12 -left-2 md:-left-6 bg-white shadow-lift rounded-2xl px-3 py-2 flex items-center gap-2 border border-card-border"
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/15 grid place-items-center text-primary">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground leading-none">Skor SKD</p>
                    <p className="text-xs font-bold leading-tight">345 / 500</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right: content */}
            <div className="order-1 md:order-2">
              <Badge variant="secondary" className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 text-success">
                <Star className="h-3 w-3" />
                <span className="text-xs font-medium">Cerita Sukses</span>
              </Badge>
              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 leading-tight">
                "3 bulan latihan di Lulusin, akhirnya lolos seleksi"
              </h3>
              <p className="text-muted-foreground mb-5 leading-relaxed">
                Cara kerja Lulusin terbukti — kombinasi bank soal real, tryout terjadwal, dan analisis kelemahan
                membantu calon ASN seperti Aisyah mempercepat persiapan.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "1.000+", label: "Alumni" },
                  { value: "87%", label: "Tingkat Lolos" },
                  { value: "2.658", label: "Bank Soal" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/70 dark:bg-card border border-card-border px-3 py-3 text-center">
                    <p className="font-display text-xl md:text-2xl font-extrabold text-primary leading-none">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bento grid: 5 features with varied gradients */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:auto-rows-fr">
            {/* Big card — Sistem CBT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8 shadow-soft hover-lift"
            >
              <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-primary/15 blur-3xl group-hover:bg-primary/25 transition-colors" />
              <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow mb-5">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Sistem CBT Realistis</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Antarmuka tryout yang persis dengan ujian aslinya — timer, navigasi soal, flagging,
                  dan auto-submit. Latih mental sebelum hari-H.
                </p>
                <div className="rounded-xl border border-card-border bg-white dark:bg-card p-4 shadow-soft backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Tryout SKD CPNS</span>
                    <Badge variant="secondary" className="bg-success/10 text-success border-0">PASS</Badge>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "TWK", score: "75 / 75", color: "bg-primary" },
                      { label: "TIU", score: "95 / 100", color: "bg-accent" },
                      { label: "TKP", score: "175 / 175", color: "bg-success" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3 text-sm">
                        <span className={`h-2 w-2 rounded-full ${row.color}`} />
                        <span className="text-muted-foreground flex-1">{row.label}</span>
                        <span className="font-semibold tabular-nums">{row.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {[
              {
                icon: FileText,
                title: "Materi Komprehensif",
                desc: "Modul terstruktur sesuai kisi-kisi terbaru.",
                gradient: "from-accent/15 via-accent/5 to-background",
                iconBg: "from-accent to-accent/70",
                iconColor: "text-white",
                glow: "bg-accent/20",
                delay: 0.1,
              },
              {
                icon: BarChart3,
                title: "Analisis Mendalam",
                desc: "Laporan hasil & ranking peserta.",
                gradient: "from-success/15 via-success/5 to-background",
                iconBg: "from-success to-success/70",
                iconColor: "text-white",
                glow: "bg-success/20",
                delay: 0.15,
              },
              {
                icon: Zap,
                title: "Belajar Cepat",
                desc: "Akses 24/7, di mana saja.",
                gradient: "from-yellow-200/40 via-amber-100/30 to-background",
                iconBg: "from-amber-500 to-yellow-500",
                iconColor: "text-white",
                glow: "bg-amber-300/30",
                delay: 0.2,
              },
              {
                icon: ShieldCheck,
                title: "Tutor Berpengalaman",
                desc: "Bimbingan dari pengajar tersertifikasi.",
                gradient: "from-primary/10 via-primary/5 to-background",
                iconBg: "from-primary to-accent",
                iconColor: "text-white",
                glow: "bg-primary/20",
                delay: 0.25,
              },
            ].map(({ icon: Icon, title, desc, gradient, iconBg, iconColor, glow, delay }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br ${gradient} p-6 shadow-soft transition-shadow hover:shadow-lift`}
              >
                <div className={`absolute -top-8 -right-8 h-32 w-32 rounded-full ${glow} blur-2xl pointer-events-none group-hover:opacity-80 transition-opacity`} />
                <div className="relative">
                  <div className={`inline-flex items-center justify-center h-11 w-11 rounded-xl bg-gradient-to-br ${iconBg} ${iconColor} shadow-soft mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section id="packages" className="py-20 px-4 bg-muted/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 rounded-full border border-primary/15 bg-primary/5 text-primary">
              <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
              Paket Belajar
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Pilih paket yang cocok untukmu</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Disesuaikan dengan kebutuhan & target ujianmu.
            </p>
          </div>

          {/* CPNS HOTS Bonus Callout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 shadow-soft"
          >
            <div className="flex-shrink-0 grid place-items-center h-12 w-12 rounded-xl bg-primary/15 text-primary">
              <Gift className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border border-primary/25 text-[10px]">BONUS EKSKLUSIF</Badge>
                <span className="text-xs text-muted-foreground hidden sm:inline">Khusus paket CPNS</span>
              </div>
              <h3 className="font-semibold text-base md:text-lg leading-snug">
                Subscribe Paket CPNS → akses 3 Tryout HOTS (2023, 2024, 2026) — 330 soal premium SKD
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Plus Grand Tryout SKD #1 dan Tryout Nasional Mei 2026. Total 5 simulasi CBT 100 menit per tryout.
              </p>
            </div>
            <Link href="/packages?category=CPNS">
              <Button size="sm" variant="default" className="rounded-full whitespace-nowrap shadow-glow">
                Lihat Paket CPNS
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari paket..."
                className="pl-9 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (packagesData ?? []).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Tidak ada paket ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(packagesData ?? []).map((pkg) => (
                <Card
                  key={pkg.id}
                  className="flex flex-col overflow-hidden hover-lift group border-card-border"
                >
                  {pkg.thumbnail ? (
                    <div className="h-44 w-full overflow-hidden">
                      <img
                        src={pkg.thumbnail}
                        alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-44 w-full bg-mesh flex items-center justify-center border-b border-card-border">
                      <BookOpen className="h-12 w-12 text-primary/50" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                        {pkg.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {pkg.durationDays} hari
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg">{pkg.name}</CardTitle>
                    <CardDescription className={cn(
                      "font-display font-bold text-2xl mt-2",
                      pkg.price === 0 ? "text-emerald-600" : "text-foreground",
                    )}>
                      {formatPriceOrFree(pkg.price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {pkg.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2 text-primary/70" />
                        {pkg.materialCount || 0} Materi
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Trophy className="h-4 w-4 mr-2 text-accent" />
                        {pkg.tryoutCount || 0} Tryout
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-card-border">
                    <Button className="w-full" asChild>
                      <Link href={`/packages/${pkg.id}`}>
                        Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimoni */}
      <section id="testimoni" className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="relative container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-primary">
              <Quote className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">Testimoni</span>
            </Badge>
            <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
              Cerita dari mereka yang <span className="text-gradient">sudah lulus</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Bukan iklan — pengalaman langsung pengguna Lulusin.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div
              className="flex gap-5 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-thin pb-4 -mx-4 px-4 md:-mx-2 md:px-2"
              role="region"
              aria-label="Testimoni pengguna"
            >
              {TESTIMONI_CARDS.map((t) => (
                <div
                  key={t.src}
                  className="snap-start shrink-0 w-[85%] sm:w-[60%] md:w-[48%] lg:w-[42%] overflow-hidden rounded-2xl shadow-lift bg-card"
                >
                  <img
                    src={t.src}
                    alt={t.alt}
                    className="block w-full h-auto"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2 md:hidden">
              ← geser untuk lihat testimoni lain →
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-10 md:p-16 text-center shadow-glow">
            <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Siap memulai perjalananmu?</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Daftar sekarang dan dapatkan akses ke ratusan materi & tryout simulasi.
              </p>
              <Button size="lg" variant="secondary" className="font-semibold h-12 px-8 text-base" asChild>
                <Link href="/register">
                  Daftar Gratis <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12 px-4">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <img src={logoUrl} alt="Lulusin" className="h-12 w-auto mb-4" />
            <p className="text-muted-foreground max-w-md">
              Platform bimbingan belajar terpercaya untuk persiapan tes CPNS, UTBK, dan ujian sekolah.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Menu</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Beranda</a></li>
              <li><a href="#packages" className="hover:text-foreground transition-colors">Paket Belajar</a></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Kontak Kami</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-border text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Lulusin. All rights reserved. &middot; Powered by{" "}
          <a
            href="https://hemitech.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors underline underline-offset-2"
          >
            Hemitech ID
          </a>
        </div>
      </footer>
      </div>
    </div>
  );
}
