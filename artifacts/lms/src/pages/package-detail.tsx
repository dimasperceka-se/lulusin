import { useParams, Link, useLocation } from "wouter";
import { useGetPackage, useCreateOrder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { BookOpen, FileText, CheckCircle2, Clock, ShieldCheck } from "lucide-react";

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
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Skeleton className="h-64 w-full mb-8 rounded-xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Paket tidak ditemukan</h2>
          <p className="text-muted-foreground mb-6">Paket yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
          <Button asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      {/* Header Banner */}
      <div className="bg-primary text-primary-foreground py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {pkg.thumbnail ? (
              <img src={pkg.thumbnail} alt={pkg.name} className="w-full md:w-1/3 rounded-xl shadow-lg object-cover aspect-video" />
            ) : (
              <div className="w-full md:w-1/3 aspect-video bg-primary-foreground/10 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-20 w-20 text-primary-foreground/30" />
              </div>
            )}
            <div className="flex-1 space-y-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {pkg.category}
                </Badge>
                <Badge variant="outline" className="text-white border-white/30">
                  <Clock className="w-3 h-3 mr-1" /> {pkg.durationDays} Hari Aktif
                </Badge>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">{pkg.name}</h1>
              <p className="text-primary-foreground/80 text-lg max-w-2xl leading-relaxed">
                {pkg.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl -mt-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <Card className="shadow-md border-primary/5">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Materi Pembelajaran
                </CardTitle>
                <CardDescription>
                  {pkg.materials?.length || 0} materi PDF yang komprehensif
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pkg.materials && pkg.materials.length > 0 ? (
                  <ul className="space-y-3">
                    {pkg.materials.map((mat, i) => (
                      <li key={mat.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                        <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-medium mt-0.5">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium">{mat.title}</p>
                          {mat.description && <p className="text-sm text-muted-foreground mt-1">{mat.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground italic p-4 bg-muted/30 rounded-lg text-center">Belum ada materi untuk paket ini.</p>
                )}
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="shadow-sm border-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Kuis Latihan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-primary mb-1">{pkg.quizzes?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Kuis per sub-materi</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    Tryout Akbar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-accent mb-1">{pkg.tryouts?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Simulasi ujian CBT</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="md:mt-0">
            <Card className="sticky top-24 shadow-lg border-primary/10 overflow-hidden">
              <div className="h-2 bg-primary w-full"></div>
              <CardHeader>
                <CardTitle className="text-2xl">Beli Paket</CardTitle>
                <CardDescription>Akses penuh selama {pkg.durationDays} hari</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground font-medium mb-1">Harga Spesial</p>
                  <p className="text-4xl font-bold text-foreground">{formatRupiah(pkg.price)}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    <span>Pembayaran Aman & Terverifikasi</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Akses instan setelah verifikasi</span>
                  </div>
                </div>

                <Button 
                  size="lg" 
                  className="w-full text-lg font-semibold h-14" 
                  onClick={handleBuy}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Memproses..." : "Beli Paket Sekarang"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
