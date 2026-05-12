import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative text-center px-6 max-w-lg">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-primary text-primary-foreground shadow-glow mb-8">
          <Compass className="h-10 w-10" />
        </div>
        <div className="font-display text-7xl md:text-8xl font-extrabold text-gradient mb-4 leading-none">
          404
        </div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-3">Halaman tidak ditemukan</h1>
        <p className="text-muted-foreground mb-8">
          Sepertinya kamu tersesat. Halaman yang kamu cari tidak tersedia atau sudah dipindahkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="shadow-glow">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">Buka Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
