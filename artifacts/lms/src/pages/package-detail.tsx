import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetPackage, useCreateOrder, useEnrollFreeTier, validateReferralCode } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatRupiah } from "@/lib/utils";
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
  Tag,
  X,
  Crown,
  Gem,
} from "lucide-react";

type TierKey = "free" | "basic" | "advance";

type TierSpec = {
  key: TierKey;
  label: string;
  tagline: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  accent: string;        // border / bg accent classes
  highlightBorder: string;
  badgeClass: string;
  badgeText?: string;
};

const TIER_SPECS: TierSpec[] = [
  {
    key: "free",
    label: "Free Access",
    tagline: "Coba dulu, gratis selamanya",
    features: ["Akses soal terbatas"],
    icon: Sparkles,
    accent: "border-card-border bg-card",
    highlightBorder: "border-card-border",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    key: "basic",
    label: "Premium Basic",
    tagline: "Latihan intensif",
    features: ["Akses soal lengkap", "Simulasi CAT"],
    icon: Gem,
    accent: "border-primary/30 bg-primary/5",
    highlightBorder: "border-primary/40",
    badgeClass: "bg-primary/10 text-primary border-primary/30",
    badgeText: "Paling laku",
  },
  {
    key: "advance",
    label: "Premium Advance",
    tagline: "Persiapan paling lengkap",
    features: ["Akses materi lengkap", "Akses soal lengkap", "Pembahasan", "Simulasi CAT"],
    icon: Crown,
    accent: "border-amber-300/60 bg-gradient-to-br from-amber-50 to-primary/5",
    highlightBorder: "border-amber-400",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    badgeText: "Direkomendasikan",
  },
];

export default function PackageDetail() {
  const { id } = useParams();
  const packageId = Number(id);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [referralInput, setReferralInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<{ code: string; holderName: string; discountPercent: number } | null>(null);
  const [validating, setValidating] = useState(false);
  const [pendingTier, setPendingTier] = useState<TierKey | null>(null);

  const { data: pkg, isLoading } = useGetPackage(packageId, {
    query: {
      enabled: !!packageId,
    }
  });

  const createOrderMutation = useCreateOrder();
  const enrollFreeMutation = useEnrollFreeTier();

  const applyReferralCode = async (rawCode: string, notify = true): Promise<string | null> => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return null;
    setValidating(true);
    try {
      const result = await validateReferralCode({ code });
      if (result.valid) {
        setAppliedReferral({
          code,
          holderName: result.holderName ?? "Partner Lulusin",
          discountPercent: result.discountPercent ?? 10,
        });
        if (notify) {
          toast({
            title: "Kode referal diterapkan",
            description: `Diskon ${result.discountPercent ?? 10}% dari ${result.holderName ?? "Partner Lulusin"}`,
          });
        }
        return code;
      }
      setAppliedReferral(null);
      if (notify) {
        toast({
          title: "Kode tidak valid",
          description: result.error ?? "Kode referal tidak ditemukan.",
          variant: "destructive",
        });
      }
      return null;
    } catch {
      if (notify) {
        toast({
          title: "Gagal validasi",
          description: "Tidak bisa menghubungi server. Coba lagi.",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setValidating(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      const code = ref.toUpperCase();
      setReferralInput(code);
      void applyReferralCode(code, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const materialsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of pkg?.materials ?? []) {
      const key = (m.category && m.category.trim()) || "Lainnya";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const preferred = ["TIU", "TWK", "TKP"];
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => {
        const ia = preferred.indexOf(a.category);
        const ib = preferred.indexOf(b.category);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return a.category.localeCompare(b.category);
      });
  }, [pkg?.materials]);

  // Cumulative counts per tier: a Basic-tier user can see free + basic items;
  // an Advance-tier user can see everything. The numbers shown on each tier card
  // are what a user at that tier will actually unlock.
  const tierCounts = useMemo(() => {
    const tagCounts = { free: { materials: 0, quizzes: 0, tryouts: 0 }, basic: { materials: 0, quizzes: 0, tryouts: 0 }, advance: { materials: 0, quizzes: 0, tryouts: 0 } };
    for (const m of pkg?.materials ?? []) tagCounts[m.tier as TierKey].materials++;
    for (const q of pkg?.quizzes ?? []) tagCounts[q.tier as TierKey].quizzes++;
    for (const t of pkg?.tryouts ?? []) tagCounts[t.tier as TierKey].tryouts++;
    const free = { ...tagCounts.free };
    const basic = {
      materials: free.materials + tagCounts.basic.materials,
      quizzes: free.quizzes + tagCounts.basic.quizzes,
      tryouts: free.tryouts + tagCounts.basic.tryouts,
    };
    const advance = {
      materials: basic.materials + tagCounts.advance.materials,
      quizzes: basic.quizzes + tagCounts.advance.quizzes,
      tryouts: basic.tryouts + tagCounts.advance.tryouts,
    };
    return { free, basic, advance };
  }, [pkg?.materials, pkg?.quizzes, pkg?.tryouts]);

  const tierPriceFor = (tier: TierKey): number | null => {
    if (!pkg) return null;
    if (tier === "free") return 0;
    if (tier === "basic") return pkg.priceBasic ?? null;
    if (tier === "advance") return pkg.priceAdvance ?? null;
    return null;
  };

  const handleApplyReferral = () => applyReferralCode(referralInput);

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput("");
  };

  const requireLogin = (): boolean => {
    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu",
      });
      setLocation("/login");
      return false;
    }
    return true;
  };

  const handleEnrollFree = () => {
    if (pkg?.maintenanceMode) {
      toast({ title: "Paket dalam maintenance", variant: "destructive" });
      return;
    }
    if (!requireLogin()) return;
    setPendingTier("free");
    enrollFreeMutation.mutate({ data: { packageId } }, {
      onSuccess: () => {
        toast({ title: "Berhasil daftar gratis", description: "Selamat belajar!" });
        setLocation(`/packages/${packageId}/learn`);
      },
      onError: (err) => {
        toast({
          title: "Gagal mendaftar",
          description: err.data?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
        setPendingTier(null);
      },
    });
  };

  const handleBuyTier = async (tier: "basic" | "advance") => {
    if (pkg?.maintenanceMode) {
      toast({ title: "Paket dalam maintenance", variant: "destructive" });
      return;
    }
    if (!requireLogin()) return;

    let codeToUse = appliedReferral?.code;
    const pendingInput = referralInput.trim().toUpperCase();
    if (!codeToUse && pendingInput) {
      const applied = await applyReferralCode(pendingInput);
      if (!applied) return;
      codeToUse = applied;
    }

    setPendingTier(tier);
    createOrderMutation.mutate({ data: { packageId, tier, referralCode: codeToUse } }, {
      onSuccess: (order) => {
        toast({
          title: "Pesanan dibuat",
          description: "Silakan selesaikan pembayaran",
        });
        setLocation(`/orders/${order.id}`);
      },
      onError: (error) => {
        toast({
          title: "Gagal membuat pesanan",
          description: error.data?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
        setPendingTier(null);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <Skeleton className="h-72 w-full mb-8 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
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
  const isMutating = createOrderMutation.isPending || enrollFreeMutation.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {pkg.maintenanceMode && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-950/50 dark:via-yellow-950/50 dark:to-amber-950/50 border-y-2 border-amber-300 dark:border-amber-800">
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
                  Tim Lulusin sedang menyempurnakan konten paket ini. Pembelian sementara dinonaktifkan.
                </p>
              </div>
              <Button variant="outline" asChild>
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

        <div className="relative container mx-auto max-w-6xl px-4 pt-10 pb-16 md:pt-14 md:pb-20 text-primary-foreground">
          <Link href="/packages">
            <span className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-8 cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke daftar paket
            </span>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
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
        {/* Tier picker */}
        <div className="bg-card border border-card-border rounded-3xl shadow-card p-6 md:p-8 mb-10">
          <div className="text-center mb-6">
            <Badge variant="secondary" className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Pilih paket akses
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-bold">Mulai dari gratis, naik tier kapan saja</h2>
            <p className="text-sm md:text-base text-muted-foreground mt-2">
              Akses berlaku selama {pkg.durationDays} hari setelah pembayaran terverifikasi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TIER_SPECS.map((spec) => {
              const Icon = spec.icon;
              const price = tierPriceFor(spec.key);
              const isPaid = spec.key !== "free";
              const unavailable = isPaid && price == null;
              const isLoadingThis = isMutating && pendingTier === spec.key;

              const discountedPrice = isPaid && appliedReferral && price != null
                ? Math.round(price * (1 - appliedReferral.discountPercent / 100))
                : null;

              return (
                <div
                  key={spec.key}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 flex flex-col",
                    spec.accent,
                    spec.highlightBorder,
                  )}
                >
                  {spec.badgeText && (
                    <Badge className={cn("absolute -top-3 left-1/2 -translate-x-1/2 border", spec.badgeClass)}>
                      {spec.badgeText}
                    </Badge>
                  )}
                  <div className={cn(
                    "inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4",
                    spec.key === "free" && "bg-emerald-100 text-emerald-700",
                    spec.key === "basic" && "bg-primary/15 text-primary",
                    spec.key === "advance" && "bg-amber-100 text-amber-700",
                  )}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold">{spec.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{spec.tagline}</p>

                  <div className="mt-4">
                    {unavailable ? (
                      <div className="text-muted-foreground italic">Belum tersedia</div>
                    ) : spec.key === "free" ? (
                      <div className="font-display text-3xl font-extrabold text-emerald-600">Free</div>
                    ) : discountedPrice != null && appliedReferral ? (
                      <div>
                        <div className="font-display text-3xl font-extrabold text-primary">
                          {formatRupiah(discountedPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground line-through mt-0.5">
                          {formatRupiah(price!)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-display text-3xl font-extrabold">
                        {formatRupiah(price!)}
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2 text-sm flex-1">
                    {spec.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className={cn(
                          "h-4 w-4 mt-0.5 shrink-0",
                          spec.key === "free" && "text-emerald-600",
                          spec.key === "basic" && "text-primary",
                          spec.key === "advance" && "text-amber-600",
                        )} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-5"
                    size="lg"
                    variant={spec.key === "advance" ? "default" : spec.key === "basic" ? "default" : "outline"}
                    disabled={unavailable || pkg.maintenanceMode || isMutating}
                    onClick={() => {
                      if (spec.key === "free") handleEnrollFree();
                      else handleBuyTier(spec.key);
                    }}
                  >
                    {pkg.maintenanceMode ? (
                      <><Wrench className="mr-2 h-4 w-4" />Maintenance</>
                    ) : isLoadingThis ? (
                      "Memproses..."
                    ) : spec.key === "free" ? (
                      "Mulai Gratis"
                    ) : (
                      `Beli ${spec.label}`
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Referral input — applies to paid tiers */}
          {!pkg.maintenanceMode && (
            <div className="mt-6 max-w-md mx-auto">
              <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3">
                <div className="flex items-center gap-2 text-xs font-medium text-primary mb-2">
                  <Tag className="h-3.5 w-3.5" />
                  Punya kode referal? (berlaku untuk tier berbayar)
                </div>
                {appliedReferral ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-background border border-emerald-200 px-3 py-2 text-sm">
                    <div className="min-w-0">
                      <div className="font-mono font-semibold text-emerald-700">{appliedReferral.code}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Diskon {appliedReferral.discountPercent}% — dari {appliedReferral.holderName}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={handleRemoveReferral} aria-label="Hapus kode">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="MISAL: BUDIPARTNER"
                      value={referralInput}
                      onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyReferral(); } }}
                      className="h-9 uppercase text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleApplyReferral}
                      disabled={validating || !referralInput.trim()}
                    >
                      {validating ? "..." : "Terapkan"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Trust signals + Fasilitas summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-success/10 text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Pembayaran aman</p>
                <p className="text-sm text-muted-foreground">Transfer bank atau QRIS</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-accent/10 text-accent">
                <Clock className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Akses instan</p>
                <p className="text-sm text-muted-foreground">Setelah pembayaran diverifikasi</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-start gap-3">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Upgrade kapan saja</p>
                <p className="text-sm text-muted-foreground">Dari Free → Basic → Advance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              Isi paket lengkap
            </CardTitle>
            <CardDescription>Akses dibuka bertahap sesuai tier yang dipilih</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 items-start p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 transition-colors">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                <FileText className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{quizCount} Kuis Latihan</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Free dapat {tierCounts.free.quizzes} · Basic dapat {tierCounts.basic.quizzes} · Advance dapat {tierCounts.advance.quizzes}
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 transition-colors">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-accent/10 text-accent flex-shrink-0">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{materialCount} Materi Pembelajaran</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Free dapat {tierCounts.free.materials} · Basic dapat {tierCounts.basic.materials} · Advance dapat {tierCounts.advance.materials}
                </p>
                {materialsByCategory.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {materialsByCategory.map(({ category, count }) => (
                      <Badge key={category} variant="secondary" className="font-medium">
                        {category}: {count}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 items-start p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/40 transition-colors">
              <span className="grid place-items-center h-10 w-10 rounded-xl bg-success/10 text-success flex-shrink-0">
                <Trophy className="h-5 w-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{tryoutCount} Tryout Akbar (CBT)</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Free dapat {tierCounts.free.tryouts} · Basic dapat {tierCounts.basic.tryouts} · Advance dapat {tierCounts.advance.tryouts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-8">
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
                  Harap dibaca dengan saksama. Dengan menyelesaikan pembelian, kamu dianggap memahami dan menyetujui ketentuan.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[55vh] pr-4">
                <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground/90 leading-relaxed">
                  <li>Seluruh pembelian paket bersifat <strong>final</strong> — tidak ada refund.</li>
                  <li>Lulusin <strong>tidak menjamin kelulusan</strong> peserta pada ujian apa pun.</li>
                  <li>Akses paket berlaku selama durasi yang tertera dan berakhir otomatis.</li>
                  <li>Akun bersifat pribadi. Dilarang dibagikan / disewakan.</li>
                  <li>Seluruh materi adalah hak cipta Lulusin; dilarang menyebarkan ulang.</li>
                  <li>Lulusin berhak mengubah materi, harga, dan ketentuan sewaktu-waktu.</li>
                </ol>
              </ScrollArea>
            </DialogContent>
          </Dialog>{" "}
          kami.
        </p>
      </section>
    </div>
  );
}
