import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import type { PreTestResult } from "@workspace/api-zod";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Clock,
  Target,
  Trophy,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

function gradeLabel(percent: number): { label: string; color: string } {
  if (percent >= 85) return { label: "Luar Biasa", color: "text-green-600" };
  if (percent >= 65) return { label: "Di Atas Rata-rata", color: "text-blue-600" };
  if (percent >= 45) return { label: "Cukup Baik", color: "text-yellow-600" };
  if (percent >= 25) return { label: "Perlu Banyak Latihan", color: "text-orange-600" };
  return { label: "Baru Mulai", color: "text-red-600" };
}

function formatMonths(m: number): string {
  if (m < 1) return `${Math.round(m * 4)} minggu`;
  if (m < 2 && m !== 1) return `${m} bulan`;
  return `${Math.round(m)} bulan`;
}

export default function PreTestResultPage() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<PreTestResult | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("preTestResult");
    if (!raw) {
      setLocation("/pre-test");
      return;
    }
    try {
      setResult(JSON.parse(raw) as PreTestResult);
    } catch {
      setLocation("/pre-test");
    }
  }, [setLocation]);

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
      </div>
    );
  }

  const percent = result.totalQuestions > 0
    ? Math.round((result.totalCorrect / result.totalQuestions) * 100)
    : 0;
  const grade = gradeLabel(percent);
  const boost = result.probabilityWithCourse - result.probabilityWithoutCourse;
  const timeSaved = result.monthsWithoutCourse - result.monthsWithCourse;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-4xl px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 rounded-full px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1.5" /> Hasil Pre-Test
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            Skor kamu:{" "}
            <span className="text-gradient">{result.totalCorrect}/{result.totalQuestions}</span>
          </h1>
          <p className={cn("text-lg font-semibold", grade.color)}>{grade.label}</p>
        </div>

        {/* Big number cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-2 border-muted">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Target className="h-4 w-4" /> Peluang Lulus (tanpa kursus)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl md:text-5xl font-bold text-muted-foreground mb-2">
                {result.probabilityWithoutCourse}%
              </div>
              <Progress value={result.probabilityWithoutCourse} className="h-2" />
              <p className="text-sm text-muted-foreground mt-3">
                Estimasi persiapan otodidak: <strong>{formatMonths(result.monthsWithoutCourse)}</strong>
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-accent/5 relative overflow-hidden">
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                <Zap className="h-3 w-3 mr-1" /> +{boost}% boost
              </Badge>
            </div>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-primary">
                <Trophy className="h-4 w-4" /> Peluang Lulus (pakai Lulusin)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                {result.probabilityWithCourse}%
              </div>
              <Progress value={result.probabilityWithCourse} className="h-2 [&>div]:bg-primary" />
              <p className="text-sm text-foreground mt-3">
                Persiapan dengan paket Lulusin:{" "}
                <strong className="text-primary">{formatMonths(result.monthsWithCourse)}</strong>{" "}
                <span className="text-muted-foreground">
                  (hemat {formatMonths(timeSaved)})
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Breakdown per category */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Rincian per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {(["TWK", "TIU", "TKP"] as const).map((cat) => {
                const b = result.breakdown[cat];
                const pct = b.total > 0 ? (b.correct / b.total) * 100 : 0;
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold">{cat}</span>
                      <span className="text-sm text-muted-foreground">
                        {b.correct}/{b.total}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {cat === "TWK" && "Wawasan Kebangsaan"}
                      {cat === "TIU" && "Intelegensi Umum"}
                      {cat === "TKP" && "Karakteristik Pribadi"}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className="mb-8 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Rekomendasi untuk Kamu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{result.recommendation}</p>
          </CardContent>
        </Card>

        {/* CTAs */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button size="lg" className="h-14 text-base font-semibold shadow-glow" asChild>
            <Link href="/packages?category=CPNS">
              <ShieldCheck className="mr-2 h-5 w-5" />
              Lihat Paket Lulusin CPNS
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-14 text-base font-semibold" asChild>
            <Link href="/pre-test">
              <Clock className="mr-2 h-5 w-5" />
              Ulangi Pre-Test
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          * Estimasi peluang & waktu berdasarkan benchmark internal Lulusin. Hasil aktual bervariasi
          tergantung konsistensi belajar.
        </p>
      </div>
    </div>
  );
}
