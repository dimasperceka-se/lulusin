import { useState } from "react";
import { Link } from "wouter";
import { useListPackages } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatRupiah } from "@/lib/utils";
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
} from "lucide-react";
import heroPhoto from "@assets/foto_bertiga-removebg-preview.png";
import logoUrl from "@assets/logo.png";
import { RobotMascot } from "@/components/robot-mascot";

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
    <div className="min-h-screen bg-background">
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

      {/* Pre-Test Mascot CTA */}
      <RobotMascot />

      {/* Features - Bento Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Kenapa pilih Lulusin?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Semua yang kamu butuhkan untuk lulus, dalam satu platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:auto-rows-fr">
            {/* Big card */}
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl border border-card-border bg-card p-8 shadow-soft hover-lift">
              <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground shadow-glow mb-5">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Sistem CBT Realistis</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  Antarmuka tryout yang persis dengan ujian aslinya — timer, navigasi soal, flagging,
                  dan auto-submit. Latih mental sebelum hari-H.
                </p>
                <div className="rounded-xl border border-card-border bg-background p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">Tryout SKD CPNS</span>
                    <Badge variant="secondary" className="bg-success/10 text-success border-0">PASS</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">TWK</span>
                      <span className="font-semibold">75 / 75</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">TIU</span>
                      <span className="font-semibold">95 / 100</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">TKP</span>
                      <span className="font-semibold">175 / 175</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 shadow-soft hover-lift">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 text-accent mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Materi Komprehensif</h3>
              <p className="text-sm text-muted-foreground">
                Modul terstruktur sesuai kisi-kisi terbaru.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 shadow-soft hover-lift">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-success/10 text-success mb-4">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Analisis Mendalam</h3>
              <p className="text-sm text-muted-foreground">
                Laporan hasil & ranking peserta.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 shadow-soft hover-lift">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Belajar Cepat</h3>
              <p className="text-sm text-muted-foreground">
                Akses 24/7, di mana saja.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-card-border bg-card p-6 shadow-soft hover-lift">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-accent/10 text-accent mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Tutor Berpengalaman</h3>
              <p className="text-sm text-muted-foreground">
                Bimbingan dari pengajar tersertifikasi.
              </p>
            </div>
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
                    <CardDescription className="font-display font-bold text-2xl text-foreground mt-2">
                      {formatRupiah(pkg.price)}
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
          &copy; {new Date().getFullYear()} Lulusin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
