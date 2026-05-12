import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTryout, useStartTryoutAttempt, useSubmitAttempt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Flag, LayoutGrid, ChevronLeft, ChevronRight, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn, formatCountdown } from "@/lib/utils";

export default function CBTInterface() {
  const { id } = useParams();
  const tryoutId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [attemptId, setAttemptId] = useState<number | null>(null);

  const { data: tryout, isLoading: isTryoutLoading } = useGetTryout(tryoutId);
  const startAttempt = useStartTryoutAttempt();
  const submitAttempt = useSubmitAttempt();

  useEffect(() => {
    if (tryout && !attemptId) {
      startAttempt.mutate(
        { id: tryoutId },
        {
          onSuccess: (data) => {
            setAttemptId(data.id);
            const endTime = new Date(data.startedAt).getTime() + (tryout.durationMinutes * 60 * 1000);
            const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
            setTimeLeft(remaining);
          },
          onError: () => {
            toast({ title: "Gagal memulai tryout", variant: "destructive" });
          }
        }
      );
    }
  }, [tryout, tryoutId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timeLeft && timeLeft > 0) {
        toast({
          title: "Peringatan Pelanggaran!",
          description: "Sistem mendeteksi Anda berpindah tab/aplikasi. Aktivitas ini tercatat.",
          variant: "destructive",
          duration: 10000,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [timeLeft, toast]);

  const handleAutoSubmit = () => {
    if (!attemptId) return;
    toast({ title: "Waktu Habis!", description: "Jawaban akan dikumpulkan otomatis." });
    doSubmit();
  };

  const doSubmit = () => {
    if (!attemptId) return;

    submitAttempt.mutate(
      { id: attemptId, data: { answers } },
      {
        onSuccess: () => {
          setLocation(`/tryout/${tryoutId}/result/${attemptId}`);
        },
        onError: () => {
          toast({ title: "Gagal mengumpulkan", variant: "destructive" });
        }
      }
    );
  };

  if (isTryoutLoading || !tryout || !attemptId || timeLeft === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col p-4">
        <Skeleton className="h-16 w-full mb-4 rounded-xl" />
        <div className="flex gap-4 flex-1">
          <Skeleton className="w-72 h-full rounded-xl" />
          <Skeleton className="flex-1 h-full rounded-xl" />
        </div>
      </div>
    );
  }

  const questions = tryout.questions || [];
  const currentQ = questions[currentIndex];

  if (!currentQ) return <div className="min-h-screen flex items-center justify-center">Error loading questions</div>;

  const toggleFlag = () => {
    const newFlagged = new Set(flagged);
    if (newFlagged.has(currentQ.id)) {
      newFlagged.delete(currentQ.id);
    } else {
      newFlagged.add(currentQ.id);
    }
    setFlagged(newFlagged);
  };

  const selectAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = timeLeft < 300;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground h-14 flex items-center justify-between px-4 shrink-0 shadow-card z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-white/15 backdrop-blur shrink-0">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="font-display font-bold text-base hidden sm:block tracking-tight shrink-0">Lulusin CBT</div>
          <div className="h-5 w-px bg-primary-foreground/30 mx-1 hidden sm:block shrink-0" />
          <div className="font-medium truncate text-sm">{tryout.title}</div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-base font-semibold border",
            isTimeCritical
              ? "bg-destructive text-destructive-foreground border-destructive/40 animate-pulse"
              : "bg-white/10 border-white/20"
          )}>
            <Clock className="w-4 h-4" />
            {formatCountdown(timeLeft)}
          </div>
          <Button
            variant="secondary"
            className="font-semibold"
            onClick={() => setShowSubmitConfirm(true)}
          >
            Selesai
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Navigation */}
        <aside className="hidden md:flex w-72 bg-card border-r border-card-border flex-col shrink-0">
          <div className="px-4 py-3 border-b border-card-border flex items-center justify-between bg-muted/30">
            <div className="font-semibold flex items-center gap-2 text-sm">
              <LayoutGrid className="w-4 h-4" />
              Navigasi Soal
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {answeredCount}/{questions.length}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id];
                const isFlagged = flagged.has(q.id);
                const isActive = currentIndex === i;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "h-10 w-10 rounded-lg text-sm font-medium flex items-center justify-center transition-all relative border",
                      isActive && "ring-2 ring-primary ring-offset-2 ring-offset-card",
                      isAnswered && !isFlagged && "bg-primary text-primary-foreground border-primary",
                      isFlagged && "bg-accent text-accent-foreground border-accent",
                      !isAnswered && !isFlagged && "bg-card hover:bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {i + 1}
                    {isAnswered && isFlagged && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-card" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 border-t border-card-border bg-muted/30 text-xs space-y-2 shrink-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-3 h-3 rounded bg-card border border-border" /> Belum dijawab
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-3 h-3 rounded bg-primary" /> Sudah dijawab
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-3 h-3 rounded bg-accent" /> Ragu-ragu
            </div>
          </div>
        </aside>

        {/* Main - Question */}
        <main className="flex-1 flex flex-col bg-background overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="font-display text-xl font-bold">Soal No. {currentIndex + 1}</div>
                {currentQ.category && (
                  <Badge variant="outline" className="uppercase text-xs">
                    {currentQ.category}
                  </Badge>
                )}
              </div>

              <div className="space-y-6">
                <div className="text-base md:text-lg leading-relaxed text-foreground whitespace-pre-wrap">
                  {currentQ.questionText}
                </div>

                {currentQ.imageUrl && (
                  <img src={currentQ.imageUrl} alt="Gambar soal" className="max-w-full h-auto rounded-xl border border-border" />
                )}

                <div className="space-y-3 pt-2">
                  {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => {
                    const val = currentQ[`option${opt}` as keyof typeof currentQ] as string;
                    if (!val) return null;

                    const isSelected = answers[currentQ.id] === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(opt)}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-soft"
                            : "border-border hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <span className={cn(
                          "flex items-center justify-center w-8 h-8 shrink-0 rounded-full border-2 text-sm font-bold transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground"
                        )}>
                          {opt}
                        </span>
                        <span className="pt-1 leading-relaxed">{val}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="h-20 border-t border-border bg-card flex items-center justify-between gap-3 px-4 md:px-6 shrink-0">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="min-w-[110px]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Sebelumnya
            </Button>

            <Button
              variant={flagged.has(currentQ.id) ? "default" : "outline"}
              size="lg"
              className={cn(
                "min-w-[110px]",
                flagged.has(currentQ.id) && "bg-accent text-accent-foreground hover:bg-accent/90 border-accent"
              )}
              onClick={toggleFlag}
            >
              <Flag className="w-4 h-4 mr-2" />
              Ragu-ragu
            </Button>

            <Button
              size="lg"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="min-w-[110px] shadow-glow"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </main>
      </div>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kumpulkan jawaban?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>Anda telah menjawab {answeredCount} dari {questions.length} soal.</p>
                {answeredCount < questions.length && (
                  <p className="font-semibold text-accent flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Masih ada {questions.length - answeredCount} soal yang belum dijawab.
                  </p>
                )}
                {flagged.size > 0 && (
                  <p className="font-semibold text-accent flex items-center gap-1.5">
                    <Flag className="w-4 h-4" />
                    Ada {flagged.size} soal yang ditandai ragu-ragu.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali Mengerjakan</AlertDialogCancel>
            <AlertDialogAction onClick={doSubmit} disabled={submitAttempt.isPending}>
              {submitAttempt.isPending ? "Mengumpulkan..." : "Ya, Kumpulkan Sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
