import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  Settings,
  Users,
  Database,
  FileQuestion,
  GraduationCap
} from "lucide-react";

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const studentLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/my-packages", label: "Paket Saya", icon: BookOpen },
    { href: "/orders", label: "Riwayat Transaksi", icon: CreditCard },
    { href: "/profile", label: "Profil", icon: Settings },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Verifikasi Pembayaran", icon: CreditCard },
    { href: "/admin/packages", label: "Kelola Paket", icon: BookOpen },
    { href: "/admin/questions", label: "Bank Soal", icon: FileQuestion },
    { href: "/admin/tryouts", label: "Kelola Tryout", icon: GraduationCap },
    { href: "/admin/quizzes", label: "Kelola Quiz", icon: FileQuestion },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/bank-accounts", label: "Rekening Bank", icon: Database },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r bg-white md:block flex-shrink-0">
        <div className="flex flex-col gap-2 p-4 sticky top-16">
          <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Utama
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || location.startsWith(`${link.href}/`);
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      <main className="flex-1 w-full max-w-full min-w-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
