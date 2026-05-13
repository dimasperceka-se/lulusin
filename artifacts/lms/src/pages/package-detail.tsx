import { useParams, Link, useLocation } from "wouter";
import { useGetPackage, useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRupiah } from "@/lib/utils";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Trophy,
  Wrench,
} from "lucide-react";

export default function PackageDetail() {
  const { id } = useParams();
  const packageId = Number(id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: pkg, isLoading } = useGetPackage(packageId, {
    query: {
      enabled: !!packageId,
    }
  });

  const createOrderMutation = useCreateOrder();

  const handleBuy = () => {
    if (pkg?.maintenanceMode) {
      toast({
        title: "Paket dalam maintenance",
        description: "Paket ini sedang dalam perbaikan dan belum bisa dibeli.",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu untuk membeli paket",
      });
      setLocation("/login");
      return;
    }

    createOrderMutation.mutate({ data: { packageId } }, {
      onSuccess: (order) => {
        toast({
          title: "Pesanan berhasil dibuat",
          description: "Silakan selesaikan pembayaran Anda",
        });
        setLocation(`/orders/${order.id}`);
      },
      onError: (error) => {
        toast({
          title: "Gagal membuat pesanan",
          description: error.data?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <Skeleton className="h-72 w-full mb-8 rounded-3xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-72 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-3xl font-bold mb-2">Paket tidak ditemukan</h2>
          <p className="text-muted-foreground mb-6">Paket yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          <Button asChild>
            <Link href="/packages">Lihat Paket Lain</Link>
          </Button>
        </div>
      </div>
    );
  }

  const quizCount = pkg.quizzes?.length || 0;
  const tryoutCount = pkg.tryouts?.length || 0;
  const materialCount = pkg.materials?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {pkg.maintenanceMode && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-950/50 dark:via-yellow-950/50 dark:to-amber-950/50 border-y-2 border-amber-300 dark:border-amber-800">
          <div
            className="absolute inset-0 pointer-events-none opacity-60"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0, transparent 14px, rgba(180,83,9,0.06) 14px, rgba(180,83,9,0.06) 28px)",
            }}
          />
          <div className="relative container mx-auto max-w-6xl px-4 py-5">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-shrink-0 h-14 w-14 rounded-full bg-amber-200 dark:bg-amber-900/60 flex items-center justify-center ring-4 ring-amber-300/40 dark:ring-amber-700/40 animate-pulse">
                <Wrench className="h-7 w-7 text-amber-700 dark:text-amber-200" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-bold text-amber-900 dark:text-amber-100 leading-tight">
                  Paket Sedang Dalam Perbaikan
                </h2>
                <p className="text-sm md:text-base text-amber-800/90 dark:text-amber-100/80 mt-1">
                  Tim Lulusin sedang menyempurnakan konten paket ini. Pembelian sementara dinonaktifkan
                  — cek paket lain atau kembali lagi nanti.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-amber-400 dark:border-amber-700 bg-white/60 dark:bg-amber-950/30 hover:bg-amber-200/70 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-100"
                asChild
              >
                <Link href="/packages">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Paket Lain
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-mesh-dark opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-[0.06] pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="relative container mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-14 md:pb-24 text-primary-foreground">
          <Link href="/packages">
            <span className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar paket
            </span>
          </Link>

          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-2">
              {pkg.thumbnail ? (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lift ring-1 ring-white/10">
                  <img src={pkg.thumbnail} alt={pkg.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-lift">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-white/5 to-transparent" />
                  <div className="absolute inset-0 grid place-items-center">
                    <BookOpen className="h-20 w-20 text-white/40" />
                  </div>
                  <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-accent/30 blur-3xl" />
                  <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-secondary/40 blur-3xl" />
                </div>
              )}
            </div>

            <div className="md:col-span-3 space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-white/15 text-white hover:bg-white/20 border border-white/15 backdrop-blur">
                  {pkg.category}
                </Badge>
                <Badge className="bg-white/10 text-white hover:bg-white/15 border border-white/15 backdrop-blur">
                  <Clock className="w-3 h-3 mr-1" /> {pkg.durationDays} hari aktif
                </Badge>
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-[1.1] tracking-tight text-balance">
                {pkg.name}
              </h1>
              <p className="text-primary-foreground/80 text-base md:text-lg leading-relaxed max-w-2xl">
                {pkg.description}
              </p>

              <div className="flex flex-wrap gap-6 pt-2 text-primary-foreground/90">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 opacity-70" />
                  <span className="text-sm">
                    <span className="font-semibold">{materialCount}</span> Materi
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 opacity-70" />
                  <span className="text-sm">
                    <span className="font-semibold">{quizCount}</span> Kuis
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 opacity-70" />
                  <span className="text-sm">
                    <span className="font-semibold">{tryoutCount}</span> Tryout
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-4 py-12 max-w-6xl -mt-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  Materi Pembelajaran
                </CardTitle>
                <CardDescription>
                  {materialCount > 0
                    ? `${materialCount} materi PDF yang komprehensif`
                    : "Materi akan segera ditambahkan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pkg.materials && pkg.materials.length > 0 ? (
                  <ul className="space-y-2">
                    {pkg.materials.map((mat, i) => (
                      <li
                        key={mat.id}
                        className="flex gap-4 items-start p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-border"
                      >
                        <div className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary flex-shrink-0 text-sm font-semibold mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{mat.title}</p>
                          {mat.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{mat.description}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-10 px-6 rounded-xl border border-dashed border-border">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-muted mb-3">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Belum ada materi untuk paket ini.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="shadow-soft hover-lift">
                <CardContent className="p-5 flex items-start gap-4">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Kuis Latihan</p>
                    <p className="font-display text-2xl font-bold mt-0.5">
                      {quizCount > 0 ? quizCount : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quizCount > 0 ? "Kuis per sub-materi" : "Belum tersedia"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover-lift">
                <CardContent className="p-5 flex items-start gap-4">
                  <span className="grid place-items-center h-11 w-11 rounded-xl bg-accent/10 text-accent flex-shrink-0">
                    <Trophy className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Tryout Akbar</p>
                    <p className="font-display text-2xl font-bold mt-0.5">
                      {tryoutCount > 0 ? tryoutCount : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tryoutCount > 0 ? "Simulasi ujian CBT" : "Belum tersedia"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Buy card */}
          <aside>
            <Card className="sticky top-24 shadow-card overflow-hidden">
              <CardHeader className="space-y-1 pb-4">
                <Badge className="w-fit bg-accent/15 text-accent hover:bg-accent/15 border border-accent/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Harga spesial
                </Badge>
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="font-display text-4xl font-bold tracking-tight">
                    {formatRupiah(pkg.price)}
                  </span>
                </div>
                <CardDescription className="pt-1">
                  Akses penuh selama {pkg.durationDays} hari
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="grid place-items-center h-7 w-7 rounded-lg bg-success/10 text-success flex-shrink-0">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </span>
                    <span>Pembayaran aman & terverifikasi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="grid place-items-center h-7 w-7 rounded-lg bg-accent/10 text-accent flex-shrink-0">
                      <Clock className="h-3.5 w-3.5" />
                    </span>
                    <span>Akses instan setelah verifikasi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="grid place-items-center h-7 w-7 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span>Refund jika tidak sesuai</span>
                  </div>
                </div>

                {pkg?.maintenanceMode ? (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full text-base font-semibold h-12"
                      disabled
                    >
                      <Wrench className="mr-2 h-4 w-4" /> Under Maintenance
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Paket ini sedang dalam perbaikan, belum bisa dibeli.
                    </p>
                  </>
                ) : (
                  <>
                    <Button
                      size="lg"
                      className="w-full text-base font-semibold h-12 shadow-glow"
                      onClick={handleBuy}
                      disabled={createOrderMutation.isPending}
                    >
                      {createOrderMutation.isPending ? "Memproses..." : "Beli Paket Sekarang"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Dengan membeli, kamu menyetujui{" "}
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                          >
                            Syarat &amp; Ketentuan
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Syarat &amp; Ketentuan Pembelian</DialogTitle>
                            <DialogDescription>
                              Harap dibaca dengan saksama. Dengan menyelesaikan
                              pembelian, kamu dianggap memahami dan menyetujui
                              ketentuan berikut sepenuhnya.
                            </DialogDescription>
                          </DialogHeader>
                          <ScrollArea className="max-h-[55vh] pr-4">
                            <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/90 leading-relaxed">
                              <li>
                                Seluruh pembelian paket bersifat <strong>final</strong>.
                                Pembeli tidak berhak meminta pengembalian dana
                                (refund) dengan alasan apa pun, termasuk namun
                                tidak terbatas pada: berubah pikiran, salah pilih
                                paket, tidak sempat belajar, atau hasil ujian
                                yang tidak sesuai harapan.
                              </li>
                              <li>
                                Lulusin <strong>tidak menjamin kelulusan</strong> peserta
                                pada ujian apa pun. Pembeli memahami bahwa hasil
                                akhir bergantung sepenuhnya pada usaha pribadi
                                masing-masing, dan tidak berhak menuntut Lulusin
                                atas hasil yang dicapai.
                              </li>
                              <li>
                                Akses paket berlaku selama durasi yang tertera
                                pada deskripsi paket dan akan berakhir secara
                                otomatis tanpa pemberitahuan. Perpanjangan
                                hanya dapat dilakukan melalui pembelian baru.
                              </li>
                              <li>
                                Akun bersifat pribadi. Dilarang membagikan,
                                meminjamkan, menyewakan, atau menjual akun
                                kepada pihak lain. Pelanggaran berakibat
                                <strong> penutupan akses permanen tanpa kompensasi
                                ataupun pengembalian dana</strong>.
                              </li>
                              <li>
                                Seluruh materi, video, soal, pembahasan, dan
                                dokumen yang tersedia adalah hak cipta Lulusin.
                                Dilarang menyalin, merekam, mendistribusikan,
                                atau memublikasikan ulang dalam bentuk apa pun.
                                Pelanggaran dapat dikenai tuntutan hukum.
                              </li>
                              <li>
                                Lulusin berhak mengubah, menambah, mengganti,
                                atau menghapus materi, soal, fitur, harga, dan
                                ketentuan layanan <strong>sewaktu-waktu</strong> tanpa
                                pemberitahuan terlebih dahulu, tanpa kewajiban
                                kompensasi kepada pembeli.
                              </li>
                              <li>
                                Layanan disediakan apa adanya (<em>as is</em>).
                                Lulusin tidak bertanggung jawab atas gangguan
                                teknis di luar kendali kami, termasuk gangguan
                                jaringan internet pembeli, perangkat pembeli,
                                penyedia pembayaran pihak ketiga, atau penyedia
                                infrastruktur cloud.
                              </li>
                              <li>
                                Pembeli bertanggung jawab atas keamanan kata
                                sandi akunnya. Lulusin tidak bertanggung jawab
                                atas kerugian akibat penyalahgunaan akun oleh
                                pihak yang tidak berwenang.
                              </li>
                              <li>
                                Promosi, diskon, voucher, dan bonus bersifat
                                terbatas dan dapat dicabut sewaktu-waktu.
                                Promosi tidak dapat digabung dengan promosi
                                lain kecuali dinyatakan secara eksplisit.
                              </li>
                              <li>
                                Dengan menyelesaikan pembelian, pembeli
                                menyetujui pemrosesan data pribadi (nama,
                                email, nomor telepon, dan riwayat aktivitas)
                                untuk keperluan operasional, peningkatan
                                layanan, dan komunikasi pemasaran dari Lulusin.
                              </li>
                              <li>
                                Setiap sengketa diutamakan diselesaikan secara
                                musyawarah. Apabila tidak tercapai, sengketa
                                tunduk pada hukum Republik Indonesia dengan
                                tempat penyelesaian di domisili Lulusin.
                              </li>
                              <li>
                                Ketentuan ini dapat diperbarui sewaktu-waktu.
                                Versi terbaru yang ditampilkan pada saat
                                pembelian merupakan versi yang berlaku dan
                                mengikat pembeli.
                              </li>
                            </ol>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>{" "}
                      kami.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
