import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, CheckCircle2, XCircle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const resetMutation = useResetPassword();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle>Link Tidak Valid</CardTitle>
              <CardDescription>Token reset tidak ditemukan di URL.</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Link href="/forgot-password">
                <span className="text-sm text-primary hover:underline cursor-pointer">
                  Minta link reset baru
                </span>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password minimal 6 karakter", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    resetMutation.mutate(
      { data: { token, newPassword: password } },
      {
        onSuccess: () => {
          setDone(true);
          setTimeout(() => setLocation("/login"), 2500);
        },
        onError: (e) => {
          toast({ title: e.data?.error || "Reset gagal", variant: "destructive" });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center">
              {done ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <KeyRound className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle>{done ? "Password Berubah" : "Reset Password"}</CardTitle>
            <CardDescription>
              {done
                ? "Password berhasil direset. Mengarahkan ke login..."
                : "Masukkan password baru Anda."}
            </CardDescription>
          </CardHeader>
          {!done && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pwd">Password Baru</Label>
                  <Input
                    id="new-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-pwd">Konfirmasi Password</Label>
                  <Input
                    id="confirm-pwd"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? "Menyimpan..." : "Reset Password"}
                </Button>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
