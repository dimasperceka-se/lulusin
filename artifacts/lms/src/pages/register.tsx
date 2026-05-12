import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { sendVerificationEmail, emailjsConfigured } from "@/lib/email";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
  targetInstitution: z.string().optional(),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const registerMutation = useRegister();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      targetInstitution: "",
    },
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate({ data: values }, {
      onSuccess: async (data) => {
        login(data.token, data.user);

        if (data.verificationToken && emailjsConfigured) {
          try {
            await sendVerificationEmail({
              toEmail: data.user.email,
              toName: data.user.name,
              token: data.verificationToken,
            });
            toast({
              title: "Pendaftaran berhasil",
              description: `Email verifikasi terkirim ke ${data.user.email}. Cek inbox.`,
            });
          } catch {
            toast({
              title: "Pendaftaran berhasil",
              description: "Tapi gagal kirim email verifikasi via EmailJS. Bisa resend dari /verify-email.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Pendaftaran berhasil",
            description: emailjsConfigured
              ? "Selamat datang di Lulusin!"
              : "EmailJS belum dikonfigurasi — verifikasi email di-skip.",
          });
        }

        setLocation("/dashboard");
      },
      onError: (error) => {
        toast({
          title: "Pendaftaran gagal",
          description: error.data?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md shadow-card border-card-border">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-display text-2xl md:text-3xl font-bold">Buat Akun Lulusin</CardTitle>
            <CardDescription>
              Mulai perjalanan belajarmu hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nama@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor WhatsApp (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="08123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="targetInstitution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instansi Tujuan (Opsional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Kemenkeu / Pemprov DKI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full mt-6 shadow-glow h-11"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Memproses..." : "Daftar Sekarang"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login">
                <span className="text-primary font-medium hover:underline cursor-pointer">Masuk</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
