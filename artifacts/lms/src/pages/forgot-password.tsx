import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle2 } from "lucide-react";
import { sendPasswordResetEmail, emailjsConfigured } from "@/lib/email";

export default function ForgotPassword() {
  const { toast } = useToast();
  const forgotMutation = useForgotPassword();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotMutation.mutate(
      { data: { email } },
      {
        onSuccess: async (data) => {
          try {
            if (emailjsConfigured) {
              await sendPasswordResetEmail({
                toEmail: data.email,
                toName: data.name,
                token: data.resetToken,
              });
              setSent(true);
            } else {
              toast({
                title: "EmailJS belum dikonfigurasi",
                description: "Cek .env (VITE_EMAILJS_*). Token sudah di-generate di server.",
                variant: "destructive",
              });
            }
          } catch {
            toast({ title: "Gagal kirim email via EmailJS", variant: "destructive" });
          }
        },
        onError: (e) => {
          toast({ title: e.data?.error || "Email tidak ditemukan", variant: "destructive" });
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
              {sent ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : (
                <Mail className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle>{sent ? "Email Terkirim" : "Lupa Password"}</CardTitle>
            <CardDescription>
              {sent
                ? `Kami sudah kirim link reset password ke ${email}. Cek inbox/spam dalam beberapa menit.`
                : "Masukkan email akun Anda. Kami akan kirim link reset password."}
            </CardDescription>
          </CardHeader>
          {!sent && (
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={forgotMutation.isPending}>
                  {forgotMutation.isPending ? "Memproses..." : "Kirim Link Reset"}
                </Button>
              </form>
            </CardContent>
          )}
          <CardFooter className="flex justify-center">
            <Link href="/login">
              <span className="text-sm text-primary hover:underline cursor-pointer">
                Kembali ke login
              </span>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
