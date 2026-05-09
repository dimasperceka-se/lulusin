import { useState } from "react";
import { useListOrders, useVerifyOrder } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Search, CheckCircle, XCircle, FileImage } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  WAITING_VERIFICATION: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  EXPIRED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("WAITING_VERIFICATION");
  const { toast } = useToast();
  
  const { data, isLoading, refetch } = useListOrders({ page, limit: 20, status: statusFilter !== 'ALL' ? statusFilter : undefined });
  const verifyMutation = useVerifyOrder();

  const handleVerify = (orderId: number, action: 'approve' | 'reject', reason?: string) => {
    verifyMutation.mutate(
      { id: orderId, data: { action, rejectionReason: reason } },
      {
        onSuccess: () => {
          toast({ title: `Pesanan berhasil ${action === 'approve' ? 'disetujui' : 'ditolak'}` });
          refetch();
        },
        onError: () => {
          toast({ title: "Gagal memproses pesanan", variant: "destructive" });
        }
      }
    );
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Verifikasi Pembayaran</h1>
            <p className="text-muted-foreground">Kelola persetujuan transaksi dari pengguna.</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={statusFilter === 'WAITING_VERIFICATION' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('WAITING_VERIFICATION')}
              size="sm"
            >
              Menunggu Verifikasi
            </Button>
            <Button 
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
              size="sm"
            >
              Semua Transaksi
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode Transaksi</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                  </TableRow>
                ) : data?.orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs font-medium">{order.orderCode}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={order.package?.name}>
                        {order.package?.name}
                      </TableCell>
                      <TableCell className="font-medium text-primary">
                        {formatRupiah(order.amount + order.uniqueAmount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(order.createdAt), "dd MMM yyyy", { locale: idLocale })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[order.status] || ''}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <VerificationDialog 
                          order={order} 
                          onVerify={handleVerify} 
                          isPending={verifyMutation.isPending} 
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}

function VerificationDialog({ order, onVerify, isPending }: { order: any, onVerify: Function, isPending: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const needsVerification = order.status === 'WAITING_VERIFICATION';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={needsVerification ? "default" : "outline"} size="sm">
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detail Pesanan {order.orderCode}</DialogTitle>
          <DialogDescription>
            {format(new Date(order.createdAt), "dd MMMM yyyy, HH:mm", { locale: idLocale })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Paket Dibeli</p>
              <p className="font-medium">{order.package?.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Transfer</p>
              <p className="font-bold text-lg text-primary">{formatRupiah(order.amount + order.uniqueAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status Saat Ini</p>
              <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <FileImage className="w-4 h-4" /> Bukti Pembayaran
            </p>
            {order.paymentProof ? (
              <div className="bg-muted/30 rounded-lg p-2 flex justify-center border">
                <img 
                  src={order.paymentProof} 
                  alt="Bukti Transfer" 
                  className="max-h-[300px] object-contain rounded"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">Pengguna belum mengunggah bukti pembayaran.</p>
            )}
          </div>

          {needsVerification && (
            <div className="border-t pt-4 mt-2 space-y-3">
              <p className="text-sm font-medium">Jika ditolak, berikan alasan:</p>
              <Textarea 
                placeholder="Contoh: Bukti transfer tidak jelas / Nominal transfer salah" 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>
        
        {needsVerification ? (
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button 
              variant="destructive" 
              onClick={() => {
                if(!rejectReason) {
                  alert("Alasan penolakan wajib diisi");
                  return;
                }
                onVerify(order.id, 'reject', rejectReason);
                setIsOpen(false);
              }}
              disabled={isPending}
            >
              <XCircle className="w-4 h-4 mr-2" /> Tolak
            </Button>
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                onVerify(order.id, 'approve');
                setIsOpen(false);
              }}
              disabled={isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Setujui Pembayaran
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Tutup</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
