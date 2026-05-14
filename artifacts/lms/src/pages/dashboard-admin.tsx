import { useState } from "react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetAdminStats,
  useGetRevenueChart,
  useGetAdminReferralStats,
  useListReferralHolders,
  useListCommissions,
  useMarkCommissionPaid,
  useListUsers,
  getListCommissionsQueryKey,
  getGetAdminReferralStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Users, Wallet, Clock, CheckCircle2, Handshake, CreditCard } from "lucide-react";

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DashboardAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "PAID">("ALL");
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutTarget, setPayoutTarget] = useState<{ id: number; holderName: string; amount: number } | null>(null);
  const [payoutNote, setPayoutNote] = useState("");

  const { data: platformStats, isLoading: platformLoading } = useGetAdminStats();
  const { data: referralStats, isLoading: refStatsLoading } = useGetAdminReferralStats();
  const { data: revenueData, isLoading: revenueLoading } = useGetRevenueChart();
  const { data: holders, isLoading: holdersLoading } = useListReferralHolders();
  const commissionParams = statusFilter === "ALL" ? undefined : { status: statusFilter };
  const { data: commissions, isLoading: commissionsLoading } = useListCommissions(commissionParams);
  const { data: usersData, isLoading: usersLoading } = useListUsers();

  const markPaid = useMarkCommissionPaid();

  function openPayoutDialog(id: number, holderName: string, amount: number) {
    setPayoutTarget({ id, holderName, amount });
    setPayoutNote("");
    setPayoutDialogOpen(true);
  }

  function confirmPayout() {
    if (!payoutTarget) return;
    markPaid.mutate({ id: payoutTarget.id, data: { note: payoutNote.trim() || null } }, {
      onSuccess: () => {
        toast({ title: "Komisi ditandai sebagai sudah dibayar" });
        queryClient.invalidateQueries({ queryKey: getListCommissionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminReferralStatsQueryKey() });
        setPayoutDialogOpen(false);
      },
      onError: (e) => {
        toast({ title: "Gagal", description: (e as { data?: { error?: string } }).data?.error || "Coba lagi", variant: "destructive" });
      },
    });
  }

  return (
    <SidebarLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="text-muted-foreground">Overview platform & program referal Lulusin.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {platformLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{usersData?.total ?? platformStats?.totalStudents ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partner Aktif</CardTitle>
              <Handshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {refStatsLoading ? <Skeleton className="h-8 w-20" /> : (
                <div className="text-2xl font-bold">{referralStats?.totalHolders ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komisi Belum Dibayar</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {refStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold text-amber-600">{formatRupiah(referralStats?.totalCommissionPending ?? 0)}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Komisi Sudah Dibayar</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {refStatsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-bold text-emerald-600">{formatRupiah(referralStats?.totalCommissionPaid ?? 0)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue Platform</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {platformLoading ? <Skeleton className="h-8 w-32" /> : (
                <>
                  <div className="text-2xl font-bold">{formatRupiah(platformStats?.totalRevenue ?? 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    +{formatRupiah(platformStats?.revenueThisMonth ?? 0)} bulan ini
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue dari Referal</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {refStatsLoading ? <Skeleton className="h-8 w-32" /> : (
                <>
                  <div className="text-2xl font-bold">{formatRupiah(referralStats?.totalReferralRevenue ?? 0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dari {referralStats?.totalReferralOrders ?? 0} transaksi referal
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {platformLoading ? <Skeleton className="h-8 w-16" /> : (
                <div className="text-2xl font-bold">{platformStats?.pendingOrders ?? 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="commissions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="commissions">Komisi</TabsTrigger>
            <TabsTrigger value="holders">Partner</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
            <TabsTrigger value="finance">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daftar Komisi</CardTitle>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "ALL" | "PENDING" | "PAID") }>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua</SelectItem>
                    <SelectItem value="PENDING">Belum Dibayar</SelectItem>
                    <SelectItem value="PAID">Sudah Dibayar</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {commissionsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : !commissions || commissions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada komisi.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Partner</TableHead>
                          <TableHead>Referee</TableHead>
                          <TableHead>Paket</TableHead>
                          <TableHead>Order</TableHead>
                          <TableHead className="text-right">Pembayaran</TableHead>
                          <TableHead className="text-right">Komisi</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commissions.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="text-xs whitespace-nowrap">{formatDate(c.createdAt)}</TableCell>
                            <TableCell>
                              <div className="font-medium">{c.holderName}</div>
                              <div className="text-xs text-muted-foreground">{c.referralCode}</div>
                            </TableCell>
                            <TableCell>
                              <div>{c.refereeName}</div>
                              <div className="text-xs text-muted-foreground">{c.refereeEmail}</div>
                            </TableCell>
                            <TableCell>{c.packageName}</TableCell>
                            <TableCell className="font-mono text-xs">{c.orderCode}</TableCell>
                            <TableCell className="text-right">{formatRupiah(c.paidAmount)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatRupiah(c.commissionAmount)}</TableCell>
                            <TableCell>
                              <Badge variant={c.status === "PAID" ? "default" : "secondary"}>
                                {c.status === "PAID" ? "Dibayar" : "Menunggu"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {c.status === "PENDING" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openPayoutDialog(c.id, c.holderName, c.commissionAmount)}
                                >
                                  Tandai Dibayar
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">{formatDate(c.payoutAt)}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holders">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Partner / Referral Holder</CardTitle>
              </CardHeader>
              <CardContent>
                {holdersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : !holders || holders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Belum ada partner terdaftar.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead>Daftar</TableHead>
                          <TableHead className="text-right">Total Referee</TableHead>
                          <TableHead className="text-right">Total Komisi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {holders.map((h) => (
                          <TableRow key={h.userId}>
                            <TableCell>{h.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{h.email}</TableCell>
                            <TableCell className="font-mono font-semibold text-primary">{h.code}</TableCell>
                            <TableCell className="text-xs">{formatDate(h.joinedAt)}</TableCell>
                            <TableCell className="text-right">{h.totalReferees}</TableCell>
                            <TableCell className="text-right font-semibold">{formatRupiah(h.totalCommission)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pengguna ({usersData?.total ?? 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                  </div>
                ) : !usersData?.users || usersData.users.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada user.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Daftar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData.users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.name}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                            </TableCell>
                            <TableCell className="text-xs">{formatDate(u.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <Card>
              <CardHeader>
                <CardTitle>Pendapatan Bulanan</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                {revenueLoading ? (
                  <Skeleton className="h-[350px] w-full" />
                ) : (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `Rp ${value / 1000000}M`} dx={-10} />
                        <Tooltip
                          formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                          {revenueData?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tandai Komisi Dibayar</DialogTitle>
            <DialogDescription>
              {payoutTarget && (
                <>Konfirmasi pembayaran <span className="font-semibold">{formatRupiah(payoutTarget.amount)}</span> kepada <span className="font-semibold">{payoutTarget.holderName}</span>.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="payout-note">Catatan (opsional)</Label>
            <Input
              id="payout-note"
              placeholder="No. referensi transfer / catatan internal"
              value={payoutNote}
              onChange={(e) => setPayoutNote(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>Batal</Button>
            <Button onClick={confirmPayout} disabled={markPaid.isPending}>
              {markPaid.isPending ? "Memproses..." : "Konfirmasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
}
