import { useParams, Link } from "wouter";
import { useGetPackage, useListTryouts } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, Calendar, ChevronLeft, ArrowRight, FileText } from "lucide-react";
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
          <Skeleton className="h-44 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
      </SidebarLayout>
    );
  }

  const list = tryouts ?? [];

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/my-packages">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Tryout: {pkg?.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Latih kesiapanmu dengan simulasi ujian sebenarnya.</p>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-card border border-dashed border-card-border rounded-2xl">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
              <GraduationCap className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-medium mb-1">Belum ada tryout</h3>
            <p className="text-muted-foreground text-sm">Tryout untuk paket ini belum tersedia.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {list.map((tryout) => (
              <Card key={tryout.id} className="overflow-hidden hover-lift group">
                <CardContent className="p-0">
                  <div className="relative bg-primary text-primary-foreground p-5 overflow-hidden">
                    <div className="absolute inset-0 bg-mesh-dark opacity-80 pointer-events-none" />
                    <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
                    <div className="relative space-y-2">
                      <Badge className="bg-white/15 text-white border border-white/15 backdrop-blur hover:bg-white/20">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {tryout.type ?? "TRYOUT"}
                      </Badge>
                      <h3 className="font-display text-lg font-bold leading-tight pr-2">
                        {tryout.title}
                      </h3>
                      <p className="text-sm text-primary-foreground/80 line-clamp-2">
                        {tryout.description || "Simulasi ujian terstruktur."}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-accent/10 text-accent flex-shrink-0">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Durasi</p>
                          <p className="font-semibold">{tryout.durationMinutes} menit</p>
                        </div>
                      </div>
                      {tryout.scheduledAt ? (
                        <div className="flex items-center gap-2.5">
                          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <Calendar className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Jadwal</p>
                            <p className="font-semibold">
                              {format(new Date(tryout.scheduledAt), "dd MMM yyyy", { locale: idLocale })}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <span className="grid place-items-center h-8 w-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">Akses</p>
                            <p className="font-semibold">Kapan saja</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button className="w-full shadow-glow" asChild>
                      <Link href={`/tryout/${tryout.id}`}>
                        Kerjakan Tryout <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
