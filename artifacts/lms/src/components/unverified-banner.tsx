import { useState } from "react";
import { useResendVerification } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { sendVerificationEmail, emailjsConfigured } from "@/lib/email";

export function UnverifiedEmailBanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const resendMutation = useResendVerification();
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = () => {
    resendMutation.mutate(
      { data: { email: user.email } },
      {
        onSuccess: async (data) => {
          try {
            if (emailjsConfigured) {
              await sendVerificationEmail({
                toEmail: data.email,
                toName: data.name,
                token: data.verificationToken,
              });
              toast({ title: "Email verifikasi terkirim", description: `Cek inbox di ${data.email}.` });
            } else {
              toast({
                title: "EmailJS belum dikonfigurasi",
                description: "Cek .env (VITE_EMAILJS_*).",
                variant: "destructive",
              });
            }
          } catch {
            toast({ title: "Gagal kirim via EmailJS", variant: "destructive" });
          }
        },
        onError: (e) => toast({ title: e.data?.error || "Gagal", variant: "destructive" }),
      },
    );
  };

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 text-yellow-900 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-100 dark:border-yellow-900">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>
          Email <strong>{user.email}</strong> belum diverifikasi. Cek inbox untuk link verifikasi.
        </span>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleResend} disabled={resendMutation.isPending}>
            {resendMutation.isPending ? "Mengirim..." : "Kirim Ulang"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setDismissed(true)}>
            Tutup
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
