import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { UnverifiedEmailBanner } from "@/components/unverified-banner";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Settings,
  Users,
  Wallet,
  FileQuestion,
  GraduationCap,
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
    { href: "/dashboard-admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Verifikasi Pembayaran", icon: CreditCard },
    { href: "/admin/packages", label: "Kelola Paket", icon: BookOpen },
    { href: "/admin/questions", label: "Bank Soal", icon: FileQuestion },
    { href: "/admin/tryouts", label: "Kelola Tryout", icon: GraduationCap },
    { href: "/admin/quizzes", label: "Kelola Quiz", icon: FileQuestion },
    { href: "/admin/users", label: "Pengguna", icon: Users },
    { href: "/admin/payment-settings", label: "Pembayaran", icon: Wallet },
  ];

  const referralHolderLinks = [
    { href: "/dashboard-referal-holder", label: "Dashboard Partner", icon: LayoutDashboard },
    { href: "/profile", label: "Profil", icon: Settings },
  ];

  const links = user?.role === "admin"
    ? adminLinks
    : user?.role === "referral_holder"
      ? referralHolderLinks
      : studentLinks;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <UnverifiedEmailBanner />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden md:block w-64 border-r border-border bg-card flex-shrink-0">
          <nav className="flex flex-col gap-1 p-3 sticky top-16">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Menu Utama
            </div>
            {links.map((link) => {
              const Icon = link.icon;
              const isActive =
                location === link.href ||
                (link.href !== "/admin" && link.href !== "/dashboard-admin" && location.startsWith(`${link.href}/`));
              return (
                <Link key={link.href} href={link.href}>
                  <span
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary" />
                    )}
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 w-full max-w-full min-w-0">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
