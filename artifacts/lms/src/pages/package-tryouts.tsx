import { useParams, Link } from "wouter";
import { useGetPackage, useListTryouts } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Clock, Calendar, ChevronLeft, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function PackageTryouts() {
  const { id } = useParams();
  const packageId = Number(id);

  const { data: pkg, isLoading: pkgLoading } = useGetPackage(packageId);
  const { data: tryouts, isLoading: tryoutsLoading } = useListTryouts({ packageId });

  if (pkgLoading || tryoutsLoading) {
    return (
      <SidebarLayout>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
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
            <h1 className="text-2xl font-bold tracking-tight">Tryout: {pkg?.name}</h1>
            <p className="text-muted-foreground text-sm">Latih kesiapanmu dengan simulasi ujian sebenarnya.</p>
          </div>
        </div>

        {tryouts?.tryouts?.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed rounded-xl">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Belum ada tryout</h3>
            <p className="text-muted-foreground mt-1">Tryout untuk paket ini belum tersedia.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tryouts?.tryouts?.map((tryout) => (
              <Card key={tryout.id} className="flex flex-col border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="h-5 w-5 text-accent" />
                    {tryout.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {tryout.description || "Tidak ada deskripsi"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" /> Durasi
                      </span>
                      <span className="font-medium text-foreground">{tryout.durationMinutes} Menit</span>
                    </div>
                    {tryout.scheduledAt && (
                      <div className="flex items-center justify-between bg-muted/30 p-2 rounded">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" /> Jadwal
                        </span>
                        <span className="font-medium text-foreground">
                          {format(new Date(tryout.scheduledAt), "dd MMM yyyy", { locale: idLocale })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90" 
                    asChild
                  >
                     <Link href={`/tryout/${tryout.id}`}>
                      Kerjakan Tryout <ArrowRight className="w-4 h-4 ml-2" />
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
