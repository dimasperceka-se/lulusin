import { Search, Play, Lightbulb, BookOpen, Smartphone, Share2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/animations";
import { DotPattern, DiagonalLines, WaveDecoration } from "@/components/BackgroundDecorations";
import { useLanguage } from "@/contexts/LanguageContext";

export function HowItWorksSection() {
  const { t } = useLanguage();

  const stepIcons = [
    <Search className="w-8 h-8 text-primary" />,
    <Play className="w-8 h-8 text-accent" />,
    <Lightbulb className="w-8 h-8 text-secondary" />,
  ];
  const stepGradients = ["from-primary/10 to-primary/5", "from-accent/10 to-accent/5", "from-secondary/10 to-secondary/5"];

  return (
    <section id="cara-kerja" className="py-24 bg-background relative overflow-hidden">
      <DotPattern className="text-primary" />
      
      {/* Decorative gradient blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-primary/[0.03] rounded-full blur-[80px]" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/[0.03] rounded-full blur-[80px]" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-semibold mb-6 tracking-wide">
            {t.howItWorks.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.howItWorks.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.howItWorks.subtitle}</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-20 left-[10%] right-[10%] h-px bg-gradient-to-r from-primary/20 via-accent/30 to-secondary/20 -z-10"></div>
          
          {t.howItWorks.steps.map((step, i) => (
            <StaggerItem key={i}>
              <div className={`relative rounded-2xl p-8 h-full flex flex-col items-center text-center bg-gradient-to-br ${stepGradients[i]} backdrop-blur-sm border border-white/60 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 border-primary/30 flex items-center justify-center text-sm font-bold text-primary shadow-md">
                  {i + 1}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-white/70 border border-white/80 flex items-center justify-center mb-6 mt-2 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {stepIcons[i]}
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1 text-sm">{step.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  const { t } = useLanguage();

  const featureIconStyles = [
    { icon: <BookOpen className="w-6 h-6" />, iconColor: "text-primary", iconBg: "bg-primary/10 border-primary/20" },
    { icon: <Play className="w-6 h-6" />, iconColor: "text-accent", iconBg: "bg-accent/10 border-accent/20" },
    { icon: <Smartphone className="w-6 h-6" />, iconColor: "text-blue-500", iconBg: "bg-blue-500/10 border-blue-500/20" },
    { icon: <BookOpen className="w-6 h-6" />, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: <Smartphone className="w-6 h-6" />, iconColor: "text-violet-500", iconBg: "bg-violet-500/10 border-violet-500/20" },
    { icon: <Share2 className="w-6 h-6" />, iconColor: "text-rose-500", iconBg: "bg-rose-500/10 border-rose-500/20" },
  ];

  return (
    <section id="fitur" className="py-24 relative overflow-hidden">
      {/* Layered background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-primary/[0.03] to-white/0 pointer-events-none"></div>
      <DiagonalLines className="text-primary" />
      
      {/* Accent blobs */}
      <div className="absolute top-20 -right-20 w-80 h-80 bg-accent/[0.04] rounded-full blur-[100px]" />
      <div className="absolute bottom-20 -left-20 w-80 h-80 bg-primary/[0.04] rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-block px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-semibold mb-6 tracking-wide">
            {t.features.badge}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t.features.title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.features.subtitle}</p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {t.features.items.map((feat, i) => {
            const style = featureIconStyles[i];
            return (
              <StaggerItem key={i}>
                <div className="group bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl p-7 h-full hover:shadow-lg transition-all duration-300 hover:border-primary/20 hover:-translate-y-1">
                  <div className={`w-14 h-14 rounded-xl ${style.iconBg} ${style.iconColor} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {style.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-foreground group-hover:text-primary transition-colors">{feat.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
