import { useState } from "react";
import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  WAITING_VERIFICATION: "bg-blue-100 text-blue-800 border-blue-200",
  PAID: "bg-green-100 text-green-800 border-green-200",
  EXPIRED: "bg-gray-100 text-gray-800 border-gray-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  WAITING_VERIFICATION: "Menunggu Verifikasi",
  PAID: "Lunas",
  EXPIRED: "Kadaluarsa",
  REJECTED: "Ditolak",
};

export default function StudentOrders() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListOrders({ page, limit: 10 });

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Riwayat Transaksi</h1>
          <p className="text-muted-foreground">Kelola pesanan paket belajar Anda.</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-dashed rounded-xl">
            <h3 className="text-lg font-medium">Belum ada transaksi</h3>
            <p className="text-muted-foreground mt-1 mb-4">Anda belum pernah melakukan pembelian paket belajar.</p>
            <Button asChild>
              <Link href="/">Cari Paket Belajar</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{order.orderCode}</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                      </span>
                      <Badge variant="outline" className={STATUS_COLORS[order.status]}>
                        {STATUS_LABELS[order.status] || order.status}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{order.package?.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Total Tagihan: <span className="font-semibold text-foreground">{formatRupiah(order.amount + order.uniqueAmount)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <Button variant={order.status === 'PENDING' ? 'default' : 'outline'} asChild>
                      <Link href={`/orders/${order.id}`}>
                        Lihat Detail
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
