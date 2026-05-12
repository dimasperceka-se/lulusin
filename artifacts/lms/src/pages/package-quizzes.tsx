import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetPackage, useListQuizzes, useStartQuizAttempt } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { FileQuestion, Clock, ChevronLeft } from "lucide-react";

export default function PackageQuizzes() {
  const { id } = useParams();
  const packageId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: pkg, isLoading: pkgLoading } = useGetPackage(packageId);
  const { data: quizzes, isLoading: quizzesLoading } = useListQuizzes(packageId);
  const startAttempt = useStartQuizAttempt();

  const handleStartQuiz = (quizId: number) => {
    startAttempt.mutate(
      { id: quizId },
      {
        onSuccess: (data) => {
          setLocation(`/quiz/${quizId}?attemptId=${data.id}`);
        },
        onError: (err) => {
          toast({ title: "Gagal memulai quiz", description: err.data?.error, variant: "destructive" });
        }
      }
    );
  };

  if (pkgLoading || quizzesLoading) {
    return (
      <SidebarLayout>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/my-packages">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Kuis: {pkg?.name}</h1>
            <p className="text-muted-foreground text-sm">Pilih kuis untuk menguji pemahamanmu.</p>
          </div>
        </div>

        {quizzes?.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-xl">
            <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Belum ada kuis</h3>
            <p className="text-muted-foreground mt-1">Kuis untuk paket ini belum tersedia.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes?.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileQuestion className="h-5 w-5 text-primary" />
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {quiz.description || "Tidak ada deskripsi"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" /> {quiz.timeLimit} Menit
                    </span>
                    <span>KKM: {quiz.passingScore}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleStartQuiz(quiz.id)}
                    disabled={startAttempt.isPending}
                  >
                    {startAttempt.isPending ? "Memulai..." : "Mulai Kuis"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
