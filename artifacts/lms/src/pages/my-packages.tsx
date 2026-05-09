import { Link } from "wouter";
import { useListEnrollments } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, ArrowRight } from "lucide-react";

export default function MyPackages() {
  const { data: enrollments, isLoading } = useListEnrollments();

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paket Saya</h1>
          <p className="text-muted-foreground">Daftar paket belajar yang sedang Anda ikuti.</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : enrollments?.length === 0 ? (
          <div className="text-center py-20 border border-dashed rounded-xl bg-white">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Belum ada paket</h3>
            <p className="text-muted-foreground mt-1 mb-4">Anda belum memiliki paket belajar aktif.</p>
            <Button asChild>
              <Link href="/">Cari Paket Belajar</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments?.map((enrollment) => (
              <Card key={enrollment.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{enrollment.package?.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progressPercent || 0}%</span>
                    </div>
                    <Progress value={enrollment.progressPercent || 0} className="h-2" />
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    Berakhir: {new Date(enrollment.expiredAt).toLocaleDateString('id-ID')}
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-muted/10">
                  <Button className="w-full" asChild>
                    <Link href={`/packages/${enrollment.packageId}/learn`}>
                      Lanjut Belajar <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
