import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
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

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const loginMutation = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate({ data: values }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        });
        setLocation(data.user.role === 'admin' ? '/admin' : '/dashboard');
      },
      onError: (error) => {
        toast({
          title: "Login gagal",
          description: error.data?.error || "Email atau password salah",
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
            <CardTitle className="font-display text-2xl md:text-3xl font-bold">Masuk ke Lulusin</CardTitle>
            <CardDescription>
              Masukkan email dan password untuk melanjutkan belajar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="nama@email.com" {...field} />
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full shadow-glow h-11"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Memproses..." : "Masuk"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/forgot-password">
                    <span className="text-muted-foreground hover:text-primary hover:underline cursor-pointer">
                      Lupa password?
                    </span>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register">
                <span className="text-primary font-medium hover:underline cursor-pointer">Daftar sekarang</span>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
