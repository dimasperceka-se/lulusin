import { useState } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetMyReferralStats, useGetMyReferees } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";
import { Copy, Check, Users, Wallet, Clock, CheckCircle2 } from "lucide-react";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - 2, 1))}@${domain}`;
}

function maskName(name: string): string {
  return name
    .split(" ")
    .map((part) => (part.length <= 2 ? part : `${part.slice(0, 2)}${"*".repeat(part.length - 2)}`))
    .join(" ");
}

export default function DashboardReferalHolder() {
  const { data: stats, isLoading: statsLoading } = useGetMyReferralStats();
  const { data: referees, isLoading: refereesLoading } = useGetMyReferees();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!stats?.code) return;
    const shareUrl = `${window.location.origin}/?ref=${stats.code}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast({ title: "Link referal disalin", description: shareUrl });
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyCodeOnly() {
    if (!stats?.code) return;
    navigator.clipboard.writeText(stats.code);
    toast({ title: "Kode disalin", description: stats.code });
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Partner</h1>
          <p className="text-muted-foreground">Pantau referal dan komisi-mu secara real-time.</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Kode Referal-mu</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-12 w-48" />
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="font-display text-3xl md:text-4xl font-bold tracking-wider text-primary">
                  {stats?.code}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyCodeOnly}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Salin Kode
                  </Button>
                  <Button size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
                    Salin Link Share
                  </Button>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Setiap orang yang daftar & beli paket pakai kode-mu = 20% komisi untukmu, 10% diskon untuk mereka.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referee</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold">{stats?.totalReferees ?? 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold">{formatRupiah(stats?.totalEarned ?? 0)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Dicairkan</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold text-amber-600">{formatRupiah(stats?.totalPending ?? 0)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Dicairkan</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold text-emerald-600">{formatRupiah(stats?.totalPaid ?? 0)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Referee</CardTitle>
          </CardHeader>
          <CardContent>
            {refereesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : !referees || referees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada referee. Bagikan kode-mu untuk mulai dapat komisi.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Komisi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referees.map((r) => (
                      <TableRow key={r.commissionId}>
                        <TableCell>{maskName(r.refereeName)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs">{maskEmail(r.refereeEmail)}</TableCell>
                        <TableCell>{r.packageName}</TableCell>
                        <TableCell className="font-mono text-xs">{r.orderCode}</TableCell>
                        <TableCell className="text-right font-semibold">{formatRupiah(r.commissionAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={r.status === "PAID" ? "default" : "secondary"}>
                            {r.status === "PAID" ? "Sudah dibayar" : "Menunggu"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
