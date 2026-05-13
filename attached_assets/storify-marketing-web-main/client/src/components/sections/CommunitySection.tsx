import { Heart, Star, ChevronDown, Download, Zap } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DotPattern, DiagonalLines, GridPattern, FloatingOrbs, WaveDecoration } from "@/components/BackgroundDecorations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export function PalestineDonationSection() {
  const { t } = useLanguage();
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-background to-primary/[0.02] relative overflow-hidden">
      <DotPattern className="text-primary" />
      
      <FadeIn>
        <div className="container mx-auto max-w-4xl bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/60 shadow-lg">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-6 mb-8">
              <div className="text-5xl flex-shrink-0 bg-gradient-to-br from-red-500/10 to-green-500/10 rounded-2xl p-3">🍉</div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">{t.donation.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t.donation.body} <strong className="text-foreground font-semibold">{t.donation.highlight}</strong> {t.donation.body2}
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-6 mb-8">
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.donation.note}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Button className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white font-bold shadow-lg shadow-accent/30 h-12 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-0.5">
                {t.donation.cta}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t.donation.transparency}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

export function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <DiagonalLines className="text-primary" />
      
      <div className="absolute top-1/3 -right-20 w-72 h-72 bg-accent/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-primary/[0.04] rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-sm font-semibold mb-6 tracking-wide">
            {t.testimonials.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.testimonials.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.testimonials.subtitle}</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.testimonials.items.map((testi, i) => (
            <StaggerItem key={i}>
              <div className="bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-6 h-full flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex text-accent mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} className="fill-accent" />
                  ))}
                </div>
                <p className="text-foreground/90 text-sm flex-1 mb-6 italic">"{testi.content}"</p>
                <div className="flex items-center gap-3 mt-auto">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testi.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {testi.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{testi.name}</h4>
                    <p className="text-xs text-muted-foreground">{testi.role}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function FAQSection() {
  const { t } = useLanguage();

  return (
    <section id="faq" className="py-24 bg-gradient-to-b from-primary/[0.02] via-white/30 to-accent/[0.02] border-y border-border/40 relative overflow-hidden">
      <GridPattern className="text-primary" />

      <div className="container mx-auto px-4 md:px-6 max-w-3xl relative z-10">
        <FadeIn className="text-center mb-20">
          <div className="inline-block px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-semibold mb-6 tracking-wide">
            {t.faq.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.faq.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.faq.subtitle}</p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {t.faq.items.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-white/70 backdrop-blur-sm px-6 rounded-xl border border-white/60 data-[state=open]:border-accent/30 data-[state=open]:bg-white/90 data-[state=open]:shadow-md transition-all duration-300">
                <AccordionTrigger className="text-left font-semibold text-base hover:no-underline hover:text-primary py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}

export function CTASection() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAndroidClick = () => {
    toast({
      title: "🔧 Maintenance",
      description: "Aplikasi android sedang dalam process maintenance.",
    });
  };

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Rich gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.06]" />
      <FloatingOrbs />
      <DotPattern className="text-primary" />
      
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/[0.05]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-accent/[0.04]" />

      <div className="container mx-auto relative z-10">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-semibold mb-8">
              <Zap size={16} />
              {t.cta.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.cta.title}</h2>
            <p className="text-muted-foreground text-lg mb-12 leading-relaxed">
              {t.cta.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://app.storify.asia/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 bg-gradient-to-r from-accent to-blue-500 hover:from-blue-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-accent/30 gap-2 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1">
                  <Zap size={20} />
                  {t.cta.ctaBrowser}
                </Button>
              </a>
              <Button size="lg" variant="outline" onClick={handleAndroidClick} className="w-full sm:w-auto h-14 px-8 font-bold rounded-xl gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300">
                <Download size={20} />
                {t.cta.ctaAndroid}
              </Button>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
