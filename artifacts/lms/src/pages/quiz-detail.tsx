import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetQuiz, useSubmitAttempt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Clock } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export default function QuizDetail() {
  const { id } = useParams();
  const quizId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Extract attemptId from query string (wouter doesn't have a built-in search params hook by default, using URLSearchParams)
  const searchParams = new URLSearchParams(window.location.search);
  const attemptId = Number(searchParams.get("attemptId"));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const { data: quiz, isLoading: isQuizLoading } = useGetQuiz(quizId);
  const submitAttempt = useSubmitAttempt();

  useEffect(() => {
    if (quiz && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(interval);
          doSubmit();
          toast({ title: "Waktu Habis", description: "Kuis dikumpulkan otomatis." });
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [timeLeft]);

  const selectAnswer = (val: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const doSubmit = () => {
    if (!attemptId) return;
    
    submitAttempt.mutate(
      { id: attemptId, data: { answers } },
      {
        onSuccess: () => {
          setLocation(`/tryout/${quizId}/result/${attemptId}?type=quiz`);
        },
        onError: () => {
          toast({ title: "Gagal mengumpulkan", variant: "destructive" });
        }
      }
    );
  };

  if (isQuizLoading || !quiz || !attemptId || timeLeft === null) {
    return (
      <div className="min-h-screen bg-muted/20 p-4 flex flex-col items-center justify-center">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 w-full max-w-3xl" />
      </div>
    );
  }

  const questions = quiz.questions || [];
  if (questions.length === 0) {
    return <div className="p-8 text-center">Kuis ini belum memiliki soal.</div>;
  }
  const currentQ = questions[currentIndex];
  const isTimeCritical = timeLeft < 60; // less than 1 min

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm">
        <div className="font-bold text-lg text-primary truncate max-w-[200px] sm:max-w-md">{quiz.title}</div>
        
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-semibold bg-slate-100",
          isTimeCritical && "bg-red-100 text-red-600 animate-pulse"
        )}>
          <Clock className="w-4 h-4" />
          {formatDuration(timeLeft)}
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div className="text-sm font-medium text-muted-foreground">
            Soal {currentIndex + 1} dari {questions.length}
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Dijawab: {Object.keys(answers).length}
          </div>
        </div>

        <Card className="flex-1 p-6 flex flex-col mb-6 shadow-sm border-slate-200">
          <div className="text-lg mb-8 leading-relaxed whitespace-pre-wrap">{currentQ.questionText}</div>
          
          {currentQ.imageUrl && (
             <img src={currentQ.imageUrl} alt="Gambar soal" className="max-w-full h-auto mb-8 rounded border" />
          )}

          <div className="space-y-3 mt-auto">
            {['A', 'B', 'C', 'D', 'E'].map((opt) => {
              const val = currentQ[`option${opt}` as keyof typeof currentQ] as string;
              if (!val) return null;
              const isSelected = answers[currentQ.id] === opt;
              
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-colors flex items-start gap-4",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                      : "border-slate-200 hover:border-primary/40 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-6 h-6 shrink-0 rounded text-sm font-bold",
                    isSelected ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {opt}
                  </div>
                  <div className="pt-0.5 leading-snug">{val}</div>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            Sebelumnya
          </Button>
          
          {currentIndex === questions.length - 1 ? (
            <Button 
              onClick={doSubmit}
              disabled={submitAttempt.isPending}
            >
              {submitAttempt.isPending ? "Mengumpulkan..." : "Kumpulkan Kuis"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
            >
              Selanjutnya
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
