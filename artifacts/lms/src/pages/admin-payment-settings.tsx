import { useState } from "react";
import {
  useListBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useGetQrisStatus,
} from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, QrCode, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function BankAccountsCard() {
  const { toast } = useToast();
  const { data: accounts, isLoading, refetch } = useListBankAccounts();
  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ bankName: "", accountNumber: "", accountHolder: "", isActive: true });

  const handleCreate = () => {
    if (!form.bankName || !form.accountNumber || !form.accountHolder) {
      toast({ title: "Lengkapi semua field", variant: "destructive" });
      return;
    }
    createMutation.mutate(
      { data: form },
      {
        onSuccess: () => {
          toast({ title: "Rekening ditambahkan" });
          setForm({ bankName: "", accountNumber: "", accountHolder: "", isActive: true });
          setOpen(false);
          refetch();
        },
        onError: () => toast({ title: "Gagal menambah rekening", variant: "destructive" }),
      },
    );
  };

  const handleToggle = (id: number, isActive: boolean) => {
    updateMutation.mutate(
      { id, data: { isActive } },
      {
        onSuccess: () => refetch(),
        onError: () => toast({ title: "Gagal mengubah status", variant: "destructive" }),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Hapus rekening ini?")) return;
    deleteMutation.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Rekening dihapus" });
          refetch();
        },
        onError: () => toast({ title: "Gagal menghapus", variant: "destructive" }),
      },
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Rekening Bank
          </CardTitle>
          <CardDescription>Rekening yang ditampilkan ke siswa saat checkout transfer manual.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Tambah Rekening
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Rekening Bank</DialogTitle>
              <DialogDescription>Rekening akan langsung tampil ke siswa kalau Aktif.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="bn">Nama Bank</Label>
                <Input
                  id="bn"
                  placeholder="BCA"
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="an">Nomor Rekening</Label>
                <Input
                  id="an"
                  placeholder="1234567890"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ah">Atas Nama</Label>
                <Input
                  id="ah"
                  placeholder="PT Lulusin Indonesia"
                  value={form.accountHolder}
                  onChange={(e) => setForm({ ...form, accountHolder: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  id="active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label htmlFor="active">Aktif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : !accounts || accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-8 bg-muted/30 rounded-lg">
            Belum ada rekening. Tambahkan di atas.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {accounts.map((bank) => (
              <div key={bank.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold text-primary flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {bank.bankName}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(bank.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="font-mono tracking-wider text-sm">{bank.accountNumber}</p>
                <p className="text-xs text-muted-foreground">a.n. {bank.accountHolder}</p>
                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                  <Switch
                    checked={bank.isActive}
                    onCheckedChange={(v) => handleToggle(bank.id, v)}
                  />
                  <span className="text-xs text-muted-foreground">{bank.isActive ? "Aktif" : "Nonaktif"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function QrisCard() {
  const { data, isLoading } = useGetQrisStatus();
  const configured = data?.configured ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" /> QRIS Interactive
        </CardTitle>
        <CardDescription>
          Dynamic QR di-generate per-order dari provider qris.interactive.co.id. Setiap order dapat QR unik
          dengan nominal otomatis terisi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Status Kredensial</p>
                <p className="text-xs text-muted-foreground">
                  Set <code className="bg-muted px-1 rounded">QRIS_INTERACTIVE_API_KEY</code> dan{" "}
                  <code className="bg-muted px-1 rounded">QRIS_INTERACTIVE_MID</code> di env.
                </p>
              </div>
              {configured ? (
                <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Terkonfigurasi
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                  <XCircle className="h-3 w-3 mr-1" /> Belum disetel
                </Badge>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/30 rounded-lg">
              <p className="font-medium text-foreground">Cara setup:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Login ke dashboard qris.interactive.co.id, ambil API Key & mID dari activation email</li>
                <li>
                  Edit <code className="bg-muted px-1 rounded">artifacts/api-server/.env</code> isi kedua
                  variable
                </li>
                <li>Restart API server (dev: re-run pnpm dev)</li>
              </ol>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPaymentSettings() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Pembayaran</h1>
          <p className="text-muted-foreground">Kelola rekening bank dan QRIS untuk metode pembayaran siswa.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <BankAccountsCard />
          <QrisCard />
        </div>
      </div>
    </SidebarLayout>
  );
}
