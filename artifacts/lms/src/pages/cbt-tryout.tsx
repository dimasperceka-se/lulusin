import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetTryout, useStartTryoutAttempt, useSubmitAttempt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Clock, Flag, LayoutGrid, CheckCircle } from "lucide-react";
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
import { cn, formatDuration } from "@/lib/utils";

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
        { data: { tryoutId } },
        {
          onSuccess: (data) => {
            setAttemptId(data.id);
            // Calculate remaining time
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

  // Anti-cheat: Warn on tab change
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
      <div className="min-h-screen bg-muted/20 flex flex-col p-4">
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex gap-4 flex-1">
          <Skeleton className="w-64 h-full" />
          <Skeleton className="flex-1 h-full" />
        </div>
      </div>
    );
  }

  const questions = tryout.questions || [];
  const currentQ = questions[currentIndex];
  
  if (!currentQ) return <div>Error loading questions</div>;

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
  const isTimeCritical = timeLeft < 300; // less than 5 mins

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-screen overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-primary text-primary-foreground h-14 flex items-center justify-between px-4 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg hidden sm:block tracking-tight">SiapLulus CBT</div>
          <div className="h-5 w-px bg-primary-foreground/30 mx-2 hidden sm:block"></div>
          <div className="font-medium truncate max-w-[200px] sm:max-w-md">{tryout.title}</div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-lg font-semibold bg-primary-foreground/10 border border-primary-foreground/20",
            isTimeCritical && "bg-red-500 text-white animate-pulse border-red-400"
          )}>
            <Clock className="w-4 h-4" />
            {formatDuration(timeLeft)}
          </div>
          <Button 
            variant="secondary" 
            className="font-bold"
            onClick={() => setShowSubmitConfirm(true)}
          >
            Selesai
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Navigation Grid */}
        <aside className="w-72 bg-white border-r flex flex-col shrink-0">
          <div className="p-3 border-b flex items-center justify-between bg-slate-50">
            <div className="font-semibold flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Navigasi Soal
            </div>
            <div className="text-sm font-medium">
              {answeredCount}/{questions.length}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
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
                      "h-10 w-10 rounded text-sm font-medium flex items-center justify-center transition-colors relative border",
                      isActive ? "ring-2 ring-primary ring-offset-1 border-primary" : "border-slate-200",
                      isAnswered && !isFlagged ? "bg-primary text-white border-primary" : "",
                      isFlagged ? "bg-orange-500 text-white border-orange-500" : "",
                      !isAnswered && !isFlagged ? "bg-white hover:bg-slate-100 text-slate-700" : ""
                    )}
                  >
                    {i + 1}
                    {/* Small dot for answered but flagged */}
                    {isAnswered && isFlagged && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="p-4 border-t bg-slate-50 text-xs space-y-2 shrink-0">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-white border border-slate-300" /> Belum Dijawab
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-primary" /> Sudah Dijawab
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded bg-orange-500" /> Ragu-ragu
             </div>
          </div>
        </aside>

        {/* Main Content - Question Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Question Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div className="text-xl font-bold text-primary">Soal No. {currentIndex + 1}</div>
                {currentQ.category && (
                  <Badge variant="outline" className="text-xs uppercase">{currentQ.category}</Badge>
                )}
              </div>

              {/* Question Content */}
              <div className="space-y-6">
                <div className="text-lg leading-relaxed whitespace-pre-wrap">
                  {currentQ.questionText}
                </div>
                
                {currentQ.imageUrl && (
                  <img src={currentQ.imageUrl} alt="Gambar soal" className="max-w-full h-auto rounded border" />
                )}

                {/* Options */}
                <div className="space-y-3 pt-4">
                  {['A', 'B', 'C', 'D', 'E'].map((opt) => {
                    const val = currentQ[`option${opt}` as keyof typeof currentQ] as string;
                    if (!val) return null;
                    
                    const isSelected = answers[currentQ.id] === opt;
                    
                    return (
                      <button
                        key={opt}
                        onClick={() => selectAnswer(opt)}
                        className={cn(
                          "w-full text-left p-4 rounded-lg border-2 transition-all flex items-start gap-4",
                          isSelected 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-7 h-7 shrink-0 rounded-full border-2 text-sm font-bold",
                          isSelected ? "border-primary bg-primary text-white" : "border-slate-300 text-slate-500"
                        )}>
                          {opt}
                        </div>
                        <div className="pt-0.5 leading-tight">{val}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="h-20 border-t bg-slate-50 flex items-center justify-between px-6 shrink-0 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)]">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="w-32"
            >
              Sebelumnya
            </Button>
            
            <Button
              variant={flagged.has(currentQ.id) ? "default" : "outline"}
              size="lg"
              className={cn("w-32", flagged.has(currentQ.id) ? "bg-orange-500 hover:bg-orange-600 text-white" : "text-orange-600 border-orange-200 hover:bg-orange-50")}
              onClick={toggleFlag}
            >
              <Flag className="w-4 h-4 mr-2" />
              Ragu-ragu
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="w-32"
            >
              Selanjutnya
            </Button>
          </div>
        </main>
      </div>

      <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kumpulkan Jawaban?</AlertDialogTitle>
            <AlertDialogDescription>
              Anda telah menjawab {answeredCount} dari {questions.length} soal.
              {answeredCount < questions.length && (
                <span className="block mt-2 font-semibold text-orange-600">
                  <AlertTriangle className="w-4 h-4 inline mr-1" />
                  Masih ada {questions.length - answeredCount} soal yang belum dijawab!
                </span>
              )}
              {flagged.size > 0 && (
                <span className="block mt-1 font-semibold text-orange-600">
                  <Flag className="w-4 h-4 inline mr-1" />
                  Ada {flagged.size} soal yang ditandai ragu-ragu.
                </span>
              )}
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
