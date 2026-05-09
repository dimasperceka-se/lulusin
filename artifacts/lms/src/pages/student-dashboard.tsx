import { Link } from "wouter";
import { useGetStudentDashboard } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function StudentDashboard() {
  const { data: dashboard, isLoading } = useGetStudentDashboard();

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </SidebarLayout>
    );
  }

  const mockChartData = [
    { name: "TO 1", score: 250 },
    { name: "TO 2", score: 310 },
    { name: "TO 3", score: 345 },
    { name: "TO 4", score: 380 },
    { name: "TO 5", score: dashboard?.latestTryoutScore || 410 },
  ];

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Belajar</h1>
          <p className="text-muted-foreground">Selamat datang kembali! Lanjutkan progres belajarmu hari ini.</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paket Aktif</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.activeEnrollments?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Paket sedang dipelajari</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kuis Selesai</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.totalQuizzesTaken || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata: {Math.round(dashboard?.averageScore || 0)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tryout Terakhir</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.latestTryoutScore !== null ? dashboard?.latestTryoutScore : '-'}</div>
              <p className="text-xs text-muted-foreground mt-1">Skor tertinggi</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Active Packages */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Paket Aktif</CardTitle>
              <CardDescription>Lanjutkan pembelajaran Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboard?.activeEnrollments && dashboard.activeEnrollments.length > 0 ? (
                <div className="space-y-6">
                  {dashboard.activeEnrollments.slice(0, 3).map((enrollment) => (
                    <div key={enrollment.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate pr-4">{enrollment.package?.name}</p>
                        <span className="text-sm text-muted-foreground shrink-0">{enrollment.progressPercent || 0}%</span>
                      </div>
                      <Progress value={enrollment.progressPercent || 0} className="h-2" />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          Sisa {Math.ceil((new Date(enrollment.expiredAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} hari
                        </span>
                        <Button variant="ghost" size="sm" className="h-8 text-primary" asChild>
                          <Link href={`/packages/${enrollment.packageId}/learn`}>
                            Lanjut Belajar <ArrowRight className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                  {dashboard.activeEnrollments.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/my-packages">Lihat Semua Paket</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Anda belum memiliki paket aktif.</p>
                  <Button asChild>
                    <Link href="/">Cari Paket Belajar</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Perkembangan Skor Tryout</CardTitle>
              <CardDescription>Grafik 5 tryout terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#1e40af', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6, fill: "hsl(var(--accent))", strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Kuis & Tryout</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recentAttempts && dashboard.recentAttempts.length > 0 ? (
              <div className="space-y-4">
                {dashboard.recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${attempt.type === 'tryout' ? 'bg-accent/10 text-accent' : 'bg-blue-100 text-blue-700'}`}>
                          {attempt.type.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">{new Date(attempt.startedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                      <p className="font-medium">{attempt.tryoutTitle || attempt.quizTitle || 'Tidak ada judul'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{attempt.score !== null ? attempt.score : '-'}</p>
                      <p className="text-xs text-muted-foreground">Skor Akhir</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">Belum ada riwayat pengerjaan.</p>
            )}
          </CardContent>
        </Card>

      </div>
    </SidebarLayout>
  );
}
