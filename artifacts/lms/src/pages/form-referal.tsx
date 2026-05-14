import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRegisterReferralHolder } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { Handshake } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  referralCode: z.string()
    .min(4, "Kode minimal 4 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(/^[A-Za-z0-9]+$/, "Hanya huruf dan angka"),
});

export default function FormReferal() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const mutation = useRegisterReferralHolder();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "", referralCode: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    mutation.mutate({ data: { ...values, referralCode: values.referralCode.toUpperCase() } }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Pendaftaran partner berhasil",
          description: "Selamat datang! Bagikan kode referalmu untuk mulai dapat komisi.",
        });
        setLocation("/dashboard-referal-holder");
      },
      onError: (error) => {
        toast({
          title: "Pendaftaran gagal",
          description: error.data?.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh pointer-events-none [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />
      <Navbar />
      <div className="relative flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-md shadow-card border-card-border">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <Handshake className="h-6 w-6" />
            </div>
            <CardTitle className="font-display text-2xl md:text-3xl font-bold">Daftar Partner Lulusin</CardTitle>
            <CardDescription>
              Pilih kode referalmu sendiri. Komisi 20% per transaksi, teman dapat diskon 10%.
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
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode Referal <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BUDIPARTNER"
                          className="uppercase"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </FormControl>
                      <FormDescription>
                        4-20 karakter, huruf dan angka. Ini yang akan kamu bagikan.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full mt-6 shadow-glow h-11"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Memproses..." : "Daftar Sebagai Partner"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 items-center text-sm text-muted-foreground">
            <div>
              Sudah jadi partner?{" "}
              <Link href="/login">
                <span className="text-primary font-medium hover:underline cursor-pointer">Masuk</span>
              </Link>
            </div>
            <div>
              Bukan partner? Daftar siswa di{" "}
              <Link href="/register">
                <span className="text-primary font-medium hover:underline cursor-pointer">sini</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
