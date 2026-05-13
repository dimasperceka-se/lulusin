import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles, ArrowRight, Loader2, Rocket } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { insertWaitlistSchema, type InsertWaitlist } from "@shared/schema";
import { useCreateWaitlist } from "@/hooks/use-waitlist";
import { FadeIn } from "@/components/animations";
import { useLanguage } from "@/contexts/LanguageContext";

export function WaitlistSection() {
  const { toast } = useToast();
  const mutation = useCreateWaitlist();
  const { t } = useLanguage();
  
  const form = useForm<InsertWaitlist>({
    resolver: zodResolver(insertWaitlistSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: InsertWaitlist) => {
    mutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: t.toast.successTitle,
          description: t.toast.successDesc,
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: t.toast.errorTitle,
          description: error.message || t.toast.errorDesc,
        });
      }
    });
  };

  return (
    <section className="py-24 bg-[#13131F] border-y border-white/5 relative overflow-hidden">
      {/* Background decorations for dark section */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-dark" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.04" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dark)" />
        </svg>
      </div>
      <div className="absolute top-20 -left-32 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <FadeIn direction="right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-6">
              <Rocket size={16} />
              {t.waitlist.badge}
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              {t.waitlist.title.split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              {t.waitlist.subtitle}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/8 transition-colors duration-300">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center mb-3">
                  <Sparkles className="text-accent" size={20} />
                </div>
                <h4 className="font-bold mb-1 text-white">{t.waitlist.uploadTitle}</h4>
                <p className="text-xs text-gray-400">{t.waitlist.uploadDesc}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-xl hover:bg-white/8 transition-colors duration-300">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center mb-3">
                  <Rocket className="text-blue-400" size={20} />
                </div>
                <h4 className="font-bold mb-1 text-white">{t.waitlist.aiTitle}</h4>
                <p className="text-xs text-gray-400">{t.waitlist.aiDesc}</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="left">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
              
              <h3 className="text-2xl font-bold mb-2 text-white relative z-10">{t.waitlist.formTitle}</h3>
              <p className="text-gray-400 mb-8 relative z-10">
                {t.waitlist.formSubtitle}
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 relative z-10">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            placeholder={t.waitlist.placeholder}
                            className="h-14 rounded-xl bg-white/5 border-white/10 focus:border-accent focus:ring-accent/20 text-white placeholder:text-gray-500"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white font-bold shadow-lg shadow-accent/30 group text-base hover:shadow-xl hover:shadow-accent/40 transition-all duration-300"
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t.waitlist.submitting}</>
                    ) : (
                      <>{t.waitlist.submit} <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-center text-gray-500 mt-4 relative z-10">
                {t.waitlist.noSpam}
              </p>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
