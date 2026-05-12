import { useState } from "react";
import { useListPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatRupiah } from "@/lib/utils";
import { Plus, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPackages() {
  const { data, isLoading, refetch } = useListPackages();
  const { toast } = useToast();
  
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();
  const deleteMutation = useDeletePackage();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    durationDays: 30,
    category: "CPNS" as any,
    thumbnail: "",
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      durationDays: 30,
      category: "CPNS",
      thumbnail: "",
      isActive: true
    });
    setEditingId(null);
  };

  const handleEdit = (pkg: any) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      durationDays: pkg.durationDays,
      category: pkg.category,
      thumbnail: pkg.thumbnail || "",
      isActive: pkg.isActive
    });
    setEditingId(pkg.id);
    setIsOpen(true);
  };

  const handleDelete = (id: number) => {
    if(confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Paket berhasil dihapus" });
          refetch();
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: formData },
        {
          onSuccess: () => {
            toast({ title: "Paket berhasil diperbarui" });
            setIsOpen(false);
            refetch();
          }
        }
      );
    } else {
      createMutation.mutate(
        { data: formData },
        {
          onSuccess: () => {
            toast({ title: "Paket berhasil ditambahkan" });
            setIsOpen(false);
            refetch();
          }
        }
      );
    }
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Paket</h1>
            <p className="text-muted-foreground">Tambah dan atur paket bimbingan belajar.</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Tambah Paket</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Paket' : 'Tambah Paket Baru'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nama Paket</Label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Kategori</Label>
                    <Select value={formData.category} onValueChange={(val: any) => setFormData({...formData, category: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CPNS">CPNS & PPPK</SelectItem>
                        <SelectItem value="SMA">SMA / UTBK</SelectItem>
                        <SelectItem value="SMP">SMP</SelectItem>
                        <SelectItem value="SD">SD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harga (Rp)</Label>
                    <Input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Durasi Aktif (Hari)</Label>
                    <Input type="number" required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>URL Thumbnail (Opsional)</Label>
                  <Input value={formData.thumbnail} onChange={e => setFormData({...formData, thumbnail: e.target.value})} placeholder="https://..." />
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t mt-4">
                  <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} />
                  <Label>Aktif & Tersedia untuk dibeli</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Batal</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? 'Simpan Perubahan' : 'Tambah Paket'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Paket</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Masa Aktif</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.packages.map((pkg) => (
                  <TableRow key={pkg.id}>
                    <TableCell className="font-medium">{pkg.name}</TableCell>
                    <TableCell><Badge variant="outline">{pkg.category}</Badge></TableCell>
                    <TableCell>{formatRupiah(pkg.price)}</TableCell>
                    <TableCell>{pkg.durationDays} Hari</TableCell>
                    <TableCell>
                      <Badge className={pkg.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'} variant="outline">
                        {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pkg)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(pkg.id)}><Trash2 className="w-4 h-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
