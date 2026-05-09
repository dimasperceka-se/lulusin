import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/lib/auth";
import { useUpdateProfile } from "@workspace/api-client-react";
import { SidebarLayout } from "@/components/sidebar-layout";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phone: z.string().optional(),
  targetInstitution: z.string().optional(),
});

export default function Profile() {
  const { user, login } = useAuth();
  const { toast } = useToast();
  
  const updateProfileMutation = useUpdateProfile();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      targetInstitution: user?.targetInstitution || "",
    },
  });

  function onSubmit(values: z.infer<typeof profileSchema>) {
    updateProfileMutation.mutate({ data: values }, {
      onSuccess: (updatedUser) => {
        // Update user context (keeping the existing token)
        login(localStorage.getItem('token') || '', updatedUser);
        toast({
          title: "Profil diperbarui",
          description: "Perubahan profil berhasil disimpan",
        });
      },
      onError: () => {
        toast({
          title: "Gagal memperbarui",
          description: "Terjadi kesalahan saat menyimpan profil",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <SidebarLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
          <p className="text-muted-foreground">Kelola informasi pribadi dan preferensi akun Anda.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Perbarui data diri Anda di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || ""} alt={user?.name} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-lg">{user?.name}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="mt-2 text-xs font-semibold px-2 py-1 bg-muted rounded inline-block uppercase">
                  Role: {user?.role}
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon / WA</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Instansi Tujuan (CPNS)</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Kemenkeu, BKN" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending || !form.formState.isDirty}
                  >
                    {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
