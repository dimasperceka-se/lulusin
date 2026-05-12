import { useState } from "react";
import { useLocation } from "wouter";
import { useGetPreTestQuestions, useSubmitPreTest } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Answer = "A" | "B" | "C" | "D" | "E";

export default function PreTest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: questions, isLoading } = useGetPreTestQuestions();
  const submitMutation = useSubmitPreTest();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  const current = questions?.[currentIdx];
  const total = questions?.length ?? 0;
  const answered = Object.keys(answers).length;
  const isLastQuestion = currentIdx === total - 1;
  const canSubmit = total > 0 && answered === total;

  const handleSelect = (qid: number, ans: Answer) => {
    setAnswers((prev) => ({ ...prev, [qid]: ans }));
  };

  const handleSubmit = () => {
    if (!questions) return;
    const payload = Object.entries(answers).map(([qid, ans]) => ({
      questionId: Number(qid),
      answer: ans,
    }));
    submitMutation.mutate(
      { data: { answers: payload } },
      {
        onSuccess: (result) => {
          sessionStorage.setItem("preTestResult", JSON.stringify(result));
          setLocation("/pre-test/result");
        },
        onError: (e) => {
          toast({
            title: "Gagal submit",
            description: e.data?.error || "Coba lagi",
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="text-2xl font-bold mb-2">Bank Soal Belum Tersedia</h2>
          <p className="text-muted-foreground mb-6">
            Pre-test belum bisa dijalankan karena bank soal kosong. Coba lagi nanti.
          </p>
          <Button onClick={() => setLocation("/")}>Kembali ke Beranda</Button>
        </div>
      </div>
    );
  }

  const progress = ((currentIdx + 1) / total) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pre-Test SKD CPNS</h1>
            <Badge variant="outline" className="text-sm">
              {answered}/{total} terjawab
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Jawab semua soal untuk lihat estimasi peluang lulus kamu. Tidak ada batas waktu.
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        {current && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-primary/10 text-primary border-0">{current.category}</Badge>
                <span className="text-sm text-muted-foreground">
                  Soal {currentIdx + 1} dari {total}
                </span>
              </div>
              <CardTitle className="text-lg md:text-xl font-medium leading-snug">
                {current.questionText}
              </CardTitle>
              <CardDescription className="sr-only">Pilih satu jawaban</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                const text = current[`option${letter}` as `option${typeof letter}`];
                const selected = answers[current.id] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => handleSelect(current.id, letter)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-3",
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-sm font-bold",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {letter}
                    </span>
                    <span className="text-sm leading-relaxed">{text}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mt-6 gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          {isLastQuestion ? (
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={!canSubmit || submitMutation.isPending}
              className="shadow-glow"
            >
              {submitMutation.isPending ? (
                "Menghitung..."
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Lihat Hasil
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}>
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {!canSubmit && isLastQuestion && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            Jawab semua {total - answered} soal yang tersisa untuk lihat hasil.
          </p>
        )}
      </div>
    </div>
  );
}
