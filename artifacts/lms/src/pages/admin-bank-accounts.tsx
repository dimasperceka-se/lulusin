import { SidebarLayout } from "@/components/sidebar-layout";

export default function AdminBankAccounts() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rekening Pembayaran</h1>
          <p className="text-muted-foreground">Kelola rekening bank untuk pembayaran manual.</p>
        </div>
        <div className="p-8 text-center border rounded-xl bg-white border-dashed">
          <p className="text-muted-foreground">Modul Admin Rekening sedang dalam pengembangan.</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
