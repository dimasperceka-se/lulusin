import { SidebarLayout } from "@/components/sidebar-layout";

export default function AdminQuizzes() {
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Kuis</h1>
          <p className="text-muted-foreground">Buat dan atur kuis latihan.</p>
        </div>
        <div className="p-8 text-center border rounded-xl bg-white border-dashed">
          <p className="text-muted-foreground">Modul Admin Kuis sedang dalam pengembangan.</p>
        </div>
      </div>
    </SidebarLayout>
  );
}
