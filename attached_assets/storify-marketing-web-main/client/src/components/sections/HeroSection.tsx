import { ArrowRight, Headphones, Star, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/animations";
import { GridPattern, FloatingOrbs, WaveDecoration } from "@/components/BackgroundDecorations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export function HeroSection() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleAndroidClick = () => {
    toast({
      title: "🔧 Maintenance",
      description: "Aplikasi android sedang dalam process maintenance.",
    });
  };
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-gradient-to-b from-primary/[0.03] via-background to-accent/[0.03]">
      {/* Background decorations */}
      <FloatingOrbs />
      <GridPattern className="text-primary" />
      
      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full border border-primary/[0.06]" />
      <div className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full border border-accent/[0.06]" />
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full border border-secondary/[0.06]" />

      <WaveDecoration className="text-primary" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 text-sm font-semibold text-accent mb-8 shadow-sm">
              <Headphones size={16} />
              <span>{t.hero.badge}</span>
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            </div>
          </FadeIn>
          
          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 tracking-tight">
              {t.hero.title1}<br />
              <span className="bg-gradient-to-r from-primary via-accent to-blue-500 bg-clip-text text-transparent">{t.hero.title2}</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
          </FadeIn>
          
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <a href="https://app.storify.asia/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-14 px-8 text-lg bg-gradient-to-r from-accent to-blue-500 hover:from-blue-500 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all duration-300 hover:-translate-y-1">
                  {t.hero.ctaPrimary}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
              <Button size="lg" variant="outline" onClick={handleAndroidClick} className="w-full sm:w-auto h-14 px-8 text-lg rounded-xl border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 gap-2">
                <Download size={20} />
                {t.hero.ctaSecondary}
              </Button>
            </div>
          </FadeIn>

          {/* Stats cards */}
          <FadeIn delay={0.5}>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 items-stretch mt-12">
              <div className="flex flex-col items-center glass-card rounded-2xl px-8 py-5 min-w-[140px]">
                <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">500+</p>
                <p className="text-sm text-muted-foreground font-medium">{t.hero.statTitles}</p>
              </div>
              <div className="flex flex-col items-center glass-card rounded-2xl px-8 py-5 min-w-[140px]">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">{t.hero.statRating}</p>
              </div>
              <div className="flex flex-col items-center glass-card rounded-2xl px-8 py-5 min-w-[140px]">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={20} className="text-primary" />
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">50K+</p>
                </div>
                <p className="text-sm text-muted-foreground font-medium">{t.hero.statListeners}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

export function SocialProofSection() {
  const { t } = useLanguage();
  
  return (
    <section className="relative py-16 border-y border-border/40 bg-gradient-to-r from-primary/[0.02] via-white/30 to-accent/[0.02] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
        <div className="absolute top-0 left-2/4 w-px h-full bg-gradient-to-b from-transparent via-accent/10 to-transparent" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-gradient-to-b from-transparent via-primary/10 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <p className="text-center text-sm font-semibold text-primary/80 mb-10 tracking-widest uppercase">
          {t.social.trusted}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-3">
          {t.social.categories.map((cat, i) => (
            <div key={i} className="px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-primary/15 text-sm font-medium text-foreground hover:bg-primary/8 hover:border-primary/25 transition-all duration-300 cursor-default shadow-sm">
              {cat}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
