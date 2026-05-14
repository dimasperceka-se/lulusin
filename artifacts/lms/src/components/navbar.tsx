import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, LayoutDashboard, Menu, Handshake } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import logoUrl from "@assets/logo.png";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/packages", label: "Paket Belajar" },
  ];

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
          : "border-transparent bg-background"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="flex items-center cursor-pointer group">
              <img
                src={logoUrl}
                alt="Lulusin"
                className="h-24 w-auto -my-4 transition-transform group-hover:scale-[1.03]"
              />
            </span>
          </Link>

          <div className="hidden md:flex gap-1 items-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group">
                  {link.label}
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
                </span>
              </Link>
            ))}
            <Link href="/form-referal">
              <span className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/15 to-accent/15 text-primary border border-primary/25 hover:border-primary/50 hover:from-primary/25 hover:to-accent/25 transition-all cursor-pointer">
                <Handshake className="h-3.5 w-3.5" />
                Jadi Partner
              </span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9 ring-2 ring-border hover:ring-primary/40 transition">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col leading-tight min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
                    <span className="flex w-full items-center cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <span className="flex w-full items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="shadow-glow">Daftar Gratis</Button>
              </Link>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-80">
              <div className="flex flex-col gap-1 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span className="block px-3 py-3 rounded-lg text-base font-medium hover:bg-muted cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                ))}
                <Link href="/form-referal">
                  <span className="flex items-center gap-2 px-3 py-3 rounded-lg text-base font-semibold text-primary hover:bg-muted cursor-pointer">
                    <Handshake className="h-4 w-4" />
                    Jadi Partner
                  </span>
                </Link>
                {!user && (
                  <div className="flex flex-col gap-2 mt-6">
                    <Link href="/login">
                      <Button variant="outline" className="w-full">Masuk</Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full shadow-glow">Daftar Gratis</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
