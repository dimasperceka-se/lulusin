import { useParams, Link } from "wouter";
import { useEffect, useState } from "react";
import { useGetOrder, useUploadPaymentProof, useUpdateOrderMethod } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah, fileToBase64 } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Copy, UploadCloud, AlertCircle, Building2, User, QrCode, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QRCodeSVG } from "qrcode.react";

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

type PaymentMethod = "BANK_TRANSFER" | "QRIS";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("BANK_TRANSFER");

  const { data: order, isLoading, refetch } = useGetOrder(orderId, {
    query: { enabled: !!orderId },
  });

  const uploadMutation = useUploadPaymentProof();
  const methodMutation = useUpdateOrderMethod();

  useEffect(() => {
    if (order?.paymentMethod) setMethod(order.paymentMethod as PaymentMethod);
  }, [order?.paymentMethod]);

  const handleMethodChange = (next: string) => {
    const value = next as PaymentMethod;
    setMethod(value);
    if (!order || order.status !== "PENDING" || value === order.paymentMethod) return;
    methodMutation.mutate(
      { id: orderId, data: { paymentMethod: value } },
      { onSuccess: () => refetch() },
    );
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const base64 = await fileToBase64(file);
      uploadMutation.mutate(
        { id: orderId, data: { paymentProof: base64 } },
        {
          onSuccess: () => {
            toast({
              title: "Berhasil diunggah",
              description: "Bukti pembayaran sedang menunggu verifikasi admin.",
            });
            refetch();
          },
          onError: (error) => {
            toast({
              title: "Gagal mengunggah",
              description: error.data?.error || "Terjadi kesalahan",
              variant: "destructive",
            });
          },
        },
      );
    } catch {
      toast({
        title: "Error file",
        description: "Gagal memproses file gambar.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Tersalin", description: `${label} disalin ke clipboard` });
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!order) {
    return (
      <SidebarLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
          <Button asChild>
            <Link href="/orders">Kembali ke Daftar Pesanan</Link>
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const isPending = order.status === "PENDING" || order.status === "REJECTED";
  const totalAmount = order.amount + order.uniqueAmount;
  const hasBank = (order.bankAccounts?.length ?? 0) > 0;
  const qrisContent = order.qrisContent;
  const qrisNmid = order.qrisNmid;
  const qrisGeneratedAt = order.qrisGeneratedAt ? new Date(order.qrisGeneratedAt) : null;
  const qrisExpiresAt = qrisGeneratedAt ? new Date(qrisGeneratedAt.getTime() + 30 * 60 * 1000) : null;
  const qrisExpired = qrisExpiresAt ? qrisExpiresAt.getTime() < Date.now() : false;
  const isQrisLoading = methodMutation.isPending && method === "QRIS";

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Detail Pesanan</h1>
            <p className="text-muted-foreground font-mono mt-1">{order.orderCode}</p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${STATUS_COLORS[order.status]}`} variant="outline">
            {STATUS_LABELS[order.status] || order.status}
          </Badge>
        </div>

        {order.status === "REJECTED" && order.rejectionReason && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Pembayaran Ditolak</AlertTitle>
            <AlertDescription>
              Alasan: {order.rejectionReason}. Silakan unggah ulang bukti pembayaran yang valid.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Belanja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="font-semibold">{order.package?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.package?.category} • {order.package?.durationDays} Hari Aktif
                    </p>
                  </div>
                  <p className="font-medium">{formatRupiah(order.amount)}</p>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Harga Paket</span>
                  <span>{formatRupiah(order.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Kode Unik</span>
                  <span className="text-accent font-medium">+{order.uniqueAmount}</span>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="font-semibold text-lg">Total Pembayaran</span>
                  <span className="font-bold text-2xl text-primary">{formatRupiah(totalAmount)}</span>
                </div>

                {isPending && (
                  <Alert className="bg-primary/5 border-primary/20 mt-4">
                    <AlertDescription className="text-primary font-medium flex items-center justify-between">
                      <span>Transfer TEPAT sesuai nominal hingga 3 digit terakhir</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(totalAmount.toString(), "Nominal transfer")}
                      >
                        Salin <Copy className="ml-2 h-3 w-3" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {isPending && (
              <Card>
                <CardHeader>
                  <CardTitle>Instruksi Pembayaran</CardTitle>
                  <CardDescription>
                    Selesaikan pembayaran sebelum{" "}
                    {format(new Date(order.expiredAt), "dd MMM yyyy, HH:mm", { locale: idLocale })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={method} onValueChange={handleMethodChange}>
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="BANK_TRANSFER">
                        <Building2 className="h-4 w-4 mr-2" />
                        Transfer Bank
                      </TabsTrigger>
                      <TabsTrigger value="QRIS">
                        <QrCode className="h-4 w-4 mr-2" />
                        QRIS
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="BANK_TRANSFER" className="space-y-4">
                      {hasBank ? (
                        <>
                          <p className="text-sm">Pilih salah satu rekening di bawah ini untuk melakukan transfer manual:</p>
                          <div className="grid sm:grid-cols-2 gap-4">
                            {order.bankAccounts?.map((bank) => (
                              <div key={bank.id} className="border rounded-lg p-4 space-y-3 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8"
                                    onClick={() => copyToClipboard(bank.accountNumber, "Nomor rekening")}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 text-primary font-bold">
                                  <Building2 className="h-5 w-5" />
                                  {bank.bankName}
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                                  <p className="font-mono text-lg tracking-wider font-semibold">{bank.accountNumber}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" /> Atas Nama
                                  </p>
                                  <p className="font-medium">{bank.accountHolder}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic text-center py-8 bg-muted/30 rounded-lg">
                          Belum ada rekening aktif. Hubungi admin.
                        </p>
                      )}
                    </TabsContent>

                    <TabsContent value="QRIS" className="space-y-4">
                      {isQrisLoading ? (
                        <div className="flex flex-col items-center gap-3 py-8">
                          <Skeleton className="w-64 h-64" />
                          <p className="text-sm text-muted-foreground">Membuat QR untuk pesanan ini...</p>
                        </div>
                      ) : qrisContent && !qrisExpired ? (
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="border rounded-lg p-4 bg-white">
                            <QRCodeSVG value={qrisContent} size={256} level="M" includeMargin={false} />
                          </div>
                          {qrisNmid && (
                            <div className="text-xs text-muted-foreground font-mono">NMID: {qrisNmid}</div>
                          )}
                          <p className="text-sm text-muted-foreground max-w-md">
                            Scan QRIS di atas dengan aplikasi e-wallet atau m-banking (GoPay, OVO, DANA,
                            ShopeePay, BCA, BRI, Mandiri, dll). Nominal sudah otomatis sebesar{" "}
                            <span className="font-semibold text-primary">{formatRupiah(totalAmount)}</span>.
                          </p>
                          {qrisExpiresAt && (
                            <p className="text-xs text-muted-foreground">
                              Berlaku sampai{" "}
                              {format(qrisExpiresAt, "HH:mm", { locale: idLocale })} ({" "}
                              {Math.max(0, Math.floor((qrisExpiresAt.getTime() - Date.now()) / 60000))} menit
                              tersisa). Upload bukti setelah bayar.
                            </p>
                          )}
                        </div>
                      ) : qrisExpired ? (
                        <div className="space-y-3 text-center py-6">
                          <p className="text-sm text-muted-foreground">
                            QR sudah kedaluwarsa (lebih dari 30 menit). Klik untuk generate ulang.
                          </p>
                          <Button
                            onClick={() =>
                              methodMutation.mutate(
                                { id: orderId, data: { paymentMethod: "QRIS" } },
                                { onSuccess: () => refetch() },
                              )
                            }
                            disabled={methodMutation.isPending}
                          >
                            {methodMutation.isPending ? "Membuat..." : "Generate QR Baru"}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic text-center py-8 bg-muted/30 rounded-lg">
                          QR belum dibuat. Pilih ulang tab QRIS untuk generate, atau hubungi admin jika error.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{isPending ? "Konfirmasi Pembayaran" : "Bukti Pembayaran"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isPending ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Upload bukti {method === "QRIS" ? "pembayaran QRIS" : "transfer"} Anda di sini agar kami
                      dapat memproses pesanan Anda.
                    </p>

                    <div
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
                        ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                        ${file ? "bg-muted/30" : ""}
                      `}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          setFile(e.dataTransfer.files[0]);
                        }
                      }}
                      onClick={() => document.getElementById("proof-upload")?.click()}
                    >
                      <input
                        id="proof-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />

                      {file ? (
                        <>
                          <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                          <p className="font-medium text-sm truncate w-full px-4">{file.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">Klik untuk mengubah file</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="font-medium text-sm">Klik atau drop gambar di sini</p>
                          <p className="text-xs text-muted-foreground mt-1">Maksimal 5MB (JPG/PNG)</p>
                        </>
                      )}
                    </div>

                    <Button className="w-full" disabled={!file || uploadMutation.isPending} onClick={handleUpload}>
                      {uploadMutation.isPending ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {order.paymentProof ? (
                      <div className="rounded-lg overflow-hidden border">
                        <img src={order.paymentProof} alt="Bukti pembayaran" className="w-full h-auto" />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic text-center py-8 bg-muted/30 rounded-lg">
                        Tidak ada bukti pembayaran
                      </p>
                    )}

                    {order.status === "PAID" && (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href={`/packages/${order.packageId}/learn`}>Mulai Belajar Sekarang</Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
