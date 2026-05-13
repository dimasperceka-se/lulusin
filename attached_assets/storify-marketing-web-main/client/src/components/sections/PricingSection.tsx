import { Check, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { GridPattern } from "@/components/BackgroundDecorations";
import { useLanguage } from "@/contexts/LanguageContext";

export function PricingSection() {
  const { t } = useLanguage();
  const highlighted = [false, true, false];

  return (
    <section id="harga" className="py-24 bg-gradient-to-b from-background via-primary/[0.02] to-background relative overflow-hidden">
      <GridPattern className="text-primary" />
      
      {/* Accent blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/[0.04] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-sm font-semibold mb-6 tracking-wide">
            <Sparkles size={14} />
            {t.pricing.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.pricing.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.pricing.subtitle}</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center mb-16">
          {t.pricing.plans.map((plan, i) => {
            const isHighlighted = highlighted[i];
            return (
              <StaggerItem key={i}>
                <div className={`rounded-2xl p-8 relative transition-all duration-300 ${
                  isHighlighted 
                    ? "bg-white border-2 border-accent/30 shadow-xl shadow-accent/10 scale-100 md:scale-105" 
                    : "bg-white/60 backdrop-blur-sm border border-white/60 hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                }`}>
                  {plan.badge && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md ${
                      isHighlighted 
                        ? "bg-gradient-to-r from-accent to-blue-500" 
                        : "bg-primary/80"
                    }`}>
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-1 text-primary">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{plan.desc}</p>
                    <div className="mb-1">
                      <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{plan.price}</span>
                    </div>
                    {plan.dailyPrice && (
                      <p className="text-green-500 text-sm font-medium mb-6">{plan.dailyPrice}</p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-full p-1 flex-shrink-0 ${isHighlighted ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"}`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span className="text-sm text-foreground/90">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-12 rounded-xl text-base font-semibold transition-all duration-300 ${
                      isHighlighted 
                        ? "bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5" 
                        : "bg-primary/5 hover:bg-primary/10 border border-primary/15 text-primary hover:border-primary/25"
                    }`}
                    onClick={() => window.open("https://app.storify.asia/auth/signin", "_blank")}
                  >
                    <QrCode size={16} className="mr-2 flex-shrink-0" />
                    {t.pricing.cta}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    {t.pricing.loginNote}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        <FadeIn className="text-center">
          <p className="text-muted-foreground text-sm mb-4">{t.pricing.paymentNote}</p>
          <div className="flex justify-center gap-6 flex-wrap">
            {["QRIS", "Bank", "E-Wallet"].map((method, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-white/60 border border-border/40 text-xs font-medium text-muted-foreground">
                {method}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
