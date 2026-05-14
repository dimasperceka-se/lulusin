import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetAttempt, useRateAttempt, getGetAttemptQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trophy, CheckCircle, XCircle, Clock, Award, BarChart3, AlertCircle, Star } from "lucide-react";
import { formatScore, cn } from "@/lib/utils";

export default function TryoutResult() {
  const { attemptId } = useParams();
  const id = Number(attemptId);
  const { data: attempt, isLoading } = useGetAttempt(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const rateMutation = useRateAttempt();

  const [hoverRating, setHoverRating] = useState<number>(0);
  const [pendingRating, setPendingRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  // Determine if it's CPNS style based on scores existing
  const isCPNS = attempt?.twkScore !== undefined && attempt?.twkScore !== null;

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full md:col-span-2" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!attempt) return <SidebarLayout>Result not found</SidebarLayout>;

  return (
    <SidebarLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hasil {attempt.type === 'tryout' ? 'Tryout' : 'Kuis'}</h1>
            <p className="text-muted-foreground mt-1">Review nilai dan pembahasan soal.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>

        {/* Top Overview Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <Card className={`md:col-span-2 border-2 ${attempt.passed ? 'border-green-200 bg-green-50/30' : attempt.passed === false ? 'border-red-200 bg-red-50/30' : 'border-primary/20'}`}>
            <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <BadgeStatus passed={attempt.passed} />
                <h2 className="text-2xl font-bold">{attempt.totalQuestions > 0 ? "Selesai Dikerjakan" : "Review Hasil"}</h2>
                <p className="text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-4 h-4" /> 
                  Dikerjakan pada {new Date(attempt.startedAt).toLocaleDateString('id-ID')}
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-full h-40 w-40 shadow-sm border-4 border-primary/10">
                <span className="text-sm text-muted-foreground font-medium mb-1">Skor Total</span>
                <span className="text-5xl font-black text-primary tabular-nums">{formatScore(attempt.score)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
             <CardContent className="p-6 flex flex-col justify-center h-full space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Benar</span>
                  </div>
                  <span className="text-xl font-bold">{attempt.correctAnswers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <span>Salah/Kosong</span>
                  </div>
                  <span className="text-xl font-bold">{attempt.totalQuestions - attempt.correctAnswers}</span>
                </div>
                {attempt.rank && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span>Peringkat</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">{attempt.rank} <span className="text-sm font-normal text-muted-foreground">/ {attempt.totalParticipants || '-'}</span></span>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>

        {/* CPNS Breakdown if applicable */}
        {isCPNS && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Rincian Nilai SKD CPNS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <ScoreBox label="TWK (Wawasan Kebangsaan)" score={attempt.twkScore || 0} passing={65} max={150} />
                <ScoreBox label="TIU (Inteligensia Umum)" score={attempt.tiuScore || 0} passing={80} max={175} />
                <ScoreBox label="TKP (Karakteristik Pribadi)" score={attempt.tkpScore || 0} passing={166} max={225} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rating Card */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              {attempt.rating ? "Rating Kamu" : "Beri Rating"}
            </CardTitle>
            <CardDescription>
              {attempt.rating
                ? "Terima kasih sudah memberi rating untuk sesi ini."
                : `Bagaimana kualitas ${attempt.type === "tryout" ? "tryout" : "kuis"} ini? Bantu kami meningkatkan konten.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => !attempt.rating && setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((star) => {
                const display = attempt.rating || hoverRating || pendingRating;
                const active = display >= star;
                const submitted = !!attempt.rating;
                return (
                  <button
                    key={star}
                    type="button"
                    disabled={submitted || rateMutation.isPending}
                    onMouseEnter={() => !submitted && setHoverRating(star)}
                    onClick={() => !submitted && setPendingRating(star)}
                    className={cn(
                      "p-1 transition-transform",
                      !submitted && "hover:scale-110 cursor-pointer",
                      submitted && "cursor-default",
                    )}
                    aria-label={`${star} bintang`}
                  >
                    <Star
                      className={cn(
                        "w-8 h-8 transition-colors",
                        active ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/40",
                      )}
                    />
                  </button>
                );
              })}
              {attempt.rating && (
                <span className="ml-3 text-sm text-muted-foreground">
                  ({attempt.rating}/5)
                </span>
              )}
            </div>

            {attempt.rating ? (
              attempt.ratingComment && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Komentar kamu</p>
                  <p className="leading-relaxed whitespace-pre-wrap">{attempt.ratingComment}</p>
                </div>
              )
            ) : (
              <>
                <Textarea
                  placeholder="Komentar (opsional) — apa yang bisa ditingkatkan?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    disabled={pendingRating === 0 || rateMutation.isPending}
                    onClick={() => {
                      rateMutation.mutate(
                        { id, data: { rating: pendingRating, comment: comment.trim() || null } },
                        {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: getGetAttemptQueryKey(id) });
                            toast({ title: "Terima kasih atas rating-mu!" });
                          },
                          onError: () => {
                            toast({ title: "Gagal mengirim rating", variant: "destructive" });
                          },
                        },
                      );
                    }}
                  >
                    {rateMutation.isPending ? "Mengirim..." : "Kirim Rating"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Answer Review List */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold mt-8 mb-4">Pembahasan Soal</h3>
          {attempt.answers?.map((ans, idx) => (
            <Card key={ans.questionId} className={`border-l-4 ${ans.isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-3 bg-muted/10">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-white shrink-0 ${ans.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      {ans.category && <span className="text-xs font-semibold text-muted-foreground uppercase">{ans.category}</span>}
                      <p className="mt-1 leading-relaxed">{ans.questionText}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${ans.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <span className="text-xs font-semibold text-muted-foreground block mb-1">Jawaban Anda</span>
                    <span className="font-medium">{ans.userAnswer ? `[${ans.userAnswer}] ${ans[`option${ans.userAnswer}` as keyof typeof ans] || ''}` : 'Tidak dijawab'}</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                    <span className="text-xs font-semibold text-green-700 block mb-1">Kunci Jawaban</span>
                    <span className="font-medium">[{ans.correctAnswer}] {ans[`option${ans.correctAnswer}` as keyof typeof ans] || ''}</span>
                  </div>
                </div>
                
                {ans.explanation && (
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg mt-4">
                    <span className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" /> Pembahasan:
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">{ans.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}

function ScoreBox({ label, score, passing, max }: { label: string, score: number, passing: number, max: number }) {
  const isPass = score >= passing;
  return (
    <div className="border rounded-lg p-4 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`} />
      <p className="text-sm font-medium text-muted-foreground mb-2 h-10">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums">{formatScore(score)}</span>
        <span className="text-sm text-muted-foreground pb-1">/ {max}</span>
      </div>
      <div className="mt-3 text-xs flex justify-between">
        <span className="text-muted-foreground">Passing Grade: {passing}</span>
        <span className={isPass ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {isPass ? 'Lulus PG' : 'Tidak Lulus PG'}
        </span>
      </div>
    </div>
  );
}

function BadgeStatus({ passed }: { passed?: boolean | null }) {
  if (passed === undefined || passed === null) return null;
  
  if (passed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold border border-green-200 mb-2">
        <Award className="w-4 h-4" /> LULUS PASSING GRADE
      </div>
    );
  }
  
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-bold border border-red-200 mb-2">
      <XCircle className="w-4 h-4" /> TIDAK LULUS PASSING GRADE
    </div>
  );
}
