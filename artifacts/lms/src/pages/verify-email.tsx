import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useVerifyEmail, useResendVerification } from "@workspace/api-client-react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { sendVerificationEmail, emailjsConfigured } from "@/lib/email";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [state, setState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setState("error");
      setErrorMsg("Token tidak ditemukan di URL.");
      return;
    }
    setState("verifying");
    verifyMutation.mutate(
      { data: { token } },
      {
        onSuccess: () => {
          setState("success");
          setTimeout(() => setLocation("/login"), 2500);
        },
        onError: (e) => {
          setState("error");
          setErrorMsg(e.data?.error || "Verifikasi gagal.");
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async () => {
    if (!email) {
      toast({ title: "Masukkan email dulu", variant: "destructive" });
      return;
    }
    resendMutation.mutate(
      { data: { email } },
      {
        onSuccess: async (data) => {
          try {
            if (emailjsConfigured) {
              await sendVerificationEmail({
                toEmail: data.email,
                toName: data.name,
                token: data.verificationToken,
              });
              toast({ title: "Email verifikasi terkirim", description: "Cek inbox Anda." });
            } else {
              toast({
                title: "EmailJS belum dikonfigurasi",
                description: `Token: ${data.verificationToken.slice(0, 12)}... (cek env VITE_EMAILJS_*)`,
                variant: "destructive",
              });
            }
          } catch {
            toast({ title: "Gagal kirim email via EmailJS", variant: "destructive" });
          }
        },
        onError: (e) => {
          toast({ title: e.data?.error || "Gagal", variant: "destructive" });
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
              {state === "success" ? (
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              ) : state === "error" ? (
                <XCircle className="h-12 w-12 text-destructive" />
              ) : (
                <Mail className="h-12 w-12 text-primary" />
              )}
            </div>
            <CardTitle>
              {state === "success"
                ? "Email Terverifikasi"
                : state === "error"
                ? "Verifikasi Gagal"
                : "Memverifikasi Email..."}
            </CardTitle>
            <CardDescription>
              {state === "success"
                ? "Mengarahkan ke halaman login..."
                : state === "error"
                ? errorMsg
                : "Mohon tunggu sebentar."}
            </CardDescription>
          </CardHeader>
          {state === "error" && (
            <CardContent className="space-y-4">
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="resend-email">Kirim ulang email verifikasi:</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="email@anda.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={handleResend}
                  disabled={resendMutation.isPending}
                >
                  {resendMutation.isPending ? "Mengirim..." : "Kirim Ulang"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer">Kembali ke login</span>
                </Link>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
