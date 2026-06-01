import { useState } from "react";
import { Link } from "wouter";
import { useListPackages } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatPriceOrFree } from "@/lib/utils";
import {
  Search,
  Clock,
  FileText,
  ArrowRight,
  BookOpen,
  Trophy,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Packages() {
  const [category, setCategory] = useState<string>("");
  const [search, setSearch] = useState("");

  const { data: packagesData, isLoading } = useListPackages({
    category: category || undefined,
    search: search || undefined,
    isActive: true,
  });

  const categories = [
    { id: "", label: "Semua" },
    { id: "CPNS", label: "CPNS & PPPK" },
    { id: "SMA", label: "SMA / UTBK" },
    { id: "SMP", label: "SMP" },
    { id: "SD", label: "SD" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mesh pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative container mx-auto max-w-6xl px-4 pt-14 pb-10 text-center">
          <Badge variant="secondary" className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Paket Belajar</span>
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Pilih paket yang <span className="text-gradient">cocok untukmu</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Disesuaikan dengan kebutuhan & target ujianmu. Dari CPNS sampai bimbel SD.
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory(cat.id)}
                  className="rounded-full"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari paket..."
                className="pl-9 rounded-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="flex flex-col overflow-hidden">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent className="flex-1">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-10 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (packagesData ?? []).length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-dashed">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-muted mb-4">
                <Search className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">Tidak ada paket ditemukan</h3>
              <p className="text-muted-foreground">Coba ubah filter atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(packagesData ?? []).map((pkg) => {
                const isMaintenance = pkg.maintenanceMode;
                return (
                  <Card
                    key={pkg.id}
                    className={cn(
                      "flex flex-col overflow-hidden group border-card-border",
                      isMaintenance ? "opacity-70" : "hover-lift",
                    )}
                  >
                    {pkg.thumbnail ? (
                      <div className="h-44 w-full overflow-hidden relative">
                        <img
                          src={pkg.thumbnail}
                          alt={pkg.name}
                          className={cn(
                            "w-full h-full object-cover transition-transform duration-500",
                            isMaintenance ? "grayscale" : "group-hover:scale-105",
                          )}
                        />
                        {isMaintenance && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Badge className="bg-yellow-100 text-yellow-900 border border-yellow-300 text-sm px-3 py-1">
                              <Wrench className="h-3.5 w-3.5 mr-1.5" />
                              Under Maintenance
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-44 w-full bg-mesh flex items-center justify-center border-b border-card-border relative">
                        <BookOpen className={cn("h-12 w-12", isMaintenance ? "text-muted-foreground/40" : "text-primary/50")} />
                        {isMaintenance && (
                          <Badge className="absolute bg-yellow-100 text-yellow-900 border border-yellow-300 text-sm px-3 py-1">
                            <Wrench className="h-3.5 w-3.5 mr-1.5" />
                            Under Maintenance
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                          {pkg.category}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {pkg.durationDays} hari
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 text-lg">{pkg.name}</CardTitle>
                      <CardDescription className={cn(
                        "font-display font-bold text-2xl mt-2",
                        pkg.price === 0 ? "text-emerald-600" : "text-foreground",
                      )}>
                        {formatPriceOrFree(pkg.price)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {pkg.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <FileText className="h-4 w-4 mr-2 text-primary/70" />
                          {pkg.materialCount || 0} Materi
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Trophy className="h-4 w-4 mr-2 text-accent" />
                          {pkg.tryoutCount || 0} Tryout
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4 border-t border-card-border">
                      {isMaintenance ? (
                        <Button className="w-full" variant="outline" disabled>
                          <Wrench className="mr-2 h-4 w-4" /> Under Maintenance
                        </Button>
                      ) : (
                        <Button className="w-full" asChild>
                          <Link href={`/packages/${pkg.id}`}>
                            Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
