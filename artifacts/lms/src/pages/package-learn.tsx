import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { useGetPackage, useListMaterials, useMarkMaterialRead } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { FileText, CheckCircle2, Circle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function PackageLearn() {
  const { id } = useParams();
  const packageId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeMaterialId, setActiveMaterialId] = useState<number | null>(null);

  const { data: pkg, isLoading: pkgLoading } = useGetPackage(packageId);
  const { data: materials, isLoading: materialsLoading, refetch } = useListMaterials(packageId);
  const markReadMutation = useMarkMaterialRead();

  const activeMaterial = materials?.find(m => m.id === activeMaterialId) || materials?.[0];

  const CATEGORY_ORDER = ["UMUM", "TWK", "TIU", "TKP"];
  const CATEGORY_LABELS: Record<string, string> = {
    UMUM: "Umum",
    TWK: "TWK — Tes Wawasan Kebangsaan",
    TIU: "TIU — Tes Intelegensi Umum",
    TKP: "TKP — Tes Karakteristik Pribadi",
  };

  const groupedMaterials = (materials ?? []).reduce<Record<string, typeof materials extends (infer T)[] | undefined ? T[] : never>>((acc, m) => {
    const key = m.category ?? "Lainnya";
    (acc[key] ??= []).push(m);
    return acc;
  }, {} as never);

  const categoryKeys = Object.keys(groupedMaterials).sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a);
    const bi = CATEGORY_ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // First render: open only the category containing the active material.
  useEffect(() => {
    if (!activeMaterial || Object.keys(openCategories).length > 0) return;
    const activeCat = activeMaterial.category ?? "Lainnya";
    setOpenCategories({ [activeCat]: true });
  }, [activeMaterial, openCategories]);

  const toggleCategory = (cat: string) =>
    setOpenCategories((s) => ({ ...s, [cat]: !s[cat] }));

  const handleMarkRead = (materialId: number) => {
    markReadMutation.mutate(
      { id: materialId },
      {
        onSuccess: () => {
          refetch();
          toast({ title: "Materi ditandai selesai" });
        },
        onError: () => {
          toast({ title: "Gagal menandai materi", variant: "destructive" });
        }
      }
    );
  };

  if (pkgLoading || materialsLoading) {
    return (
      <SidebarLayout>
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid md:grid-cols-4 gap-6">
          <Skeleton className="h-[600px] w-full md:col-span-1" />
          <Skeleton className="h-[600px] w-full md:col-span-3" />
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
            <h1 className="text-2xl font-bold tracking-tight">{pkg?.name}</h1>
            <p className="text-muted-foreground text-sm">Pilih materi untuk mulai belajar.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Sidebar Daftar Materi */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Daftar Materi</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {categoryKeys.map((cat) => {
                  const isOpen = openCategories[cat] ?? false;
                  const items = groupedMaterials[cat];
                  return (
                    <Collapsible key={cat} open={isOpen} onOpenChange={() => toggleCategory(cat)}>
                      <CollapsibleTrigger
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left",
                          "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
                          "hover:bg-muted transition-colors",
                        )}
                      >
                        <span className="flex-1 truncate">
                          {CATEGORY_LABELS[cat] ?? cat}{" "}
                          <span className="ml-1 text-muted-foreground/70 normal-case">({items.length})</span>
                        </span>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isOpen && "rotate-90",
                          )}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1 mb-2">
                        {items.map((material) => {
                          const isActive = activeMaterial?.id === material.id;
                          return (
                            <button
                              key={material.id}
                              onClick={() => setActiveMaterialId(material.id)}
                              className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors",
                                isActive ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                              )}
                            >
                              <div className="mt-0.5 shrink-0">
                                {material.isRead ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm leading-tight">{material.title}</p>
                              </div>
                            </button>
                          );
                        })}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}

                {materials?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada materi</p>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Main Content Area */}
          <Card className="md:col-span-3 flex flex-col overflow-hidden relative">
            {activeMaterial ? (
              <>
                <div className="p-4 border-b flex justify-between items-center bg-white z-10">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">{activeMaterial.title}</h2>
                  </div>
                  <Button 
                    variant={activeMaterial.isRead ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleMarkRead(activeMaterial.id)}
                    disabled={activeMaterial.isRead || markReadMutation.isPending}
                  >
                    {activeMaterial.isRead ? (
                      <><CheckCircle2 className="h-4 w-4 mr-2" /> Selesai</>
                    ) : "Tandai Selesai"}
                  </Button>
                </div>
                
                <div className="flex-1 relative bg-slate-100 overflow-hidden">
                  {/* Watermark Overlay (Anti-piracy) */}
                  <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden opacity-[0.03]">
                    <div className="transform -rotate-45 text-4xl font-bold whitespace-nowrap">
                      {Array(10).fill(`${user?.email} - ${user?.name}   `).join('')}
                    </div>
                  </div>

                  {activeMaterial.content ? (
                    <div className="w-full h-full overflow-auto bg-white">
                      <article className="prose prose-slate dark:prose-invert max-w-3xl mx-auto px-6 py-8 prose-headings:scroll-mt-20 prose-img:rounded-lg prose-table:text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {activeMaterial.content}
                        </ReactMarkdown>
                      </article>
                    </div>
                  ) : activeMaterial.fileUrl ? (
                    <iframe
                      src={`${activeMaterial.fileUrl}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={activeMaterial.title}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-8 text-center">
                      <div>
                        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-medium mb-2">{activeMaterial.title}</h3>
                        <p className="text-muted-foreground">
                          {activeMaterial.description || "Tidak ada konten materi."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Pilih materi di samping untuk mulai membaca
              </div>
            )}
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
}
