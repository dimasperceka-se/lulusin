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
import { Search, Clock, FileText, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Lulus Tes Impianmu <br className="hidden md:block"/>Bersama SiapLulus
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-10">
            Platform belajar intensif untuk persiapan CPNS, UTBK, dan bimbingan belajar sekolah dengan sistem Tryout CBT terbaik di Indonesia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="font-semibold" asChild>
              <a href="#packages">Lihat Paket Belajar</a>
            </Button>
            <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-white" asChild>
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Materi Komprehensif</h3>
              <p className="text-muted-foreground">Modul pembelajaran terstruktur, padat, dan mudah dipahami sesuai kisi-kisi terbaru.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Sistem CBT Realistis</h3>
              <p className="text-muted-foreground">Simulasi tryout dengan antarmuka yang persis dengan ujian aslinya untuk melatih mental.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6">
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Analisis Statistik</h3>
              <p className="text-muted-foreground">Laporan hasil belajar mendetail dan perbandingan ranking dengan peserta lain.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pilih Paket Belajar</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami menyediakan berbagai paket belajar yang disesuaikan dengan kebutuhan Anda. Pilih dan mulai belajar sekarang.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
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
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="flex flex-col">
                  <div className="h-48 bg-muted animate-pulse rounded-t-lg" />
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
            <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
              <h3 className="text-xl font-medium mb-2">Tidak ada paket ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(packagesData ?? []).map((pkg) => (
                <Card key={pkg.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow group border-primary/10">
                  {pkg.thumbnail ? (
                    <div className="h-48 w-full overflow-hidden">
                      <img src={pkg.thumbnail} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-primary/5 flex items-center justify-center border-b">
                      <BookOpen className="h-12 w-12 text-primary/30" />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {pkg.category}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {pkg.durationDays} Hari
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{pkg.name}</CardTitle>
                    <CardDescription className="font-semibold text-lg text-foreground mt-2">
                      {formatRupiah(pkg.price)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {pkg.description}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <FileText className="h-4 w-4 mr-2 text-primary/70" />
                        {pkg.materialCount || 0} Materi
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-accent/70" />
                        {pkg.tryoutCount || 0} Tryout
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t bg-muted/10">
                    <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground" asChild>
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

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 px-4 border-t border-primary-foreground/10">
        <div className="container mx-auto max-w-6xl grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <h2 className="text-2xl font-bold mb-4 tracking-tight">SiapLulus</h2>
            <p className="text-primary-foreground/70 max-w-md">
              Platform bimbingan belajar terpercaya untuk persiapan tes CPNS, UTBK, dan ujian sekolah. Belajar lebih efektif dengan sistem yang terstruktur.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Menu</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#" className="hover:text-white transition-colors">Beranda</a></li>
              <li><a href="#packages" className="hover:text-white transition-colors">Paket Belajar</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Masuk</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Daftar</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-lg">Bantuan</h3>
            <ul className="space-y-2 text-primary-foreground/70">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kontak Kami</a></li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto max-w-6xl mt-12 pt-8 border-t border-primary-foreground/10 text-center text-primary-foreground/50 text-sm">
          &copy; {new Date().getFullYear()} SiapLulus. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
