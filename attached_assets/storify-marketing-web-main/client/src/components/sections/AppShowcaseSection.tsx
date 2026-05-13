import { BookOpen, Headphones, Smartphone, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/animations";
import { DotPattern, DiagonalLines } from "@/components/BackgroundDecorations";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Showcase 1 — Laptop Jelajahi (2.png)
 * Placed after HowItWorksSection: shows browsing experience
 */
export function ShowcaseBrowse() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-accent/[0.03]" />
      <DotPattern className="text-primary" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Text */}
          <FadeIn className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-sm font-semibold mb-6 tracking-wide">
              <BookOpen size={14} />
              {t.showcase1.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-primary leading-tight">
              {t.showcase1.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t.showcase1.desc}
            </p>
            <div className="space-y-4">
              {t.showcase1.points.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} />
                  </div>
                  <p className="text-foreground/90 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Image */}
          <FadeIn delay={0.2} className="order-1 lg:order-2 flex justify-center">
            <div className="relative group w-full max-w-sm">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-accent/10 to-blue-500/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src="/2.png"
                alt={t.showcase1.title}
                className="relative rounded-2xl shadow-xl border border-white/40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/**
 * Showcase 2 — Mobile Home / Audiobook Player (5.png)
 * Placed after FeaturesSection: shows listening experience
 */
export function ShowcaseListen() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-accent/[0.03] via-background to-primary/[0.03]" />
      <DiagonalLines className="text-accent" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
          {/* Image */}
          <FadeIn className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-accent/10 via-blue-500/10 to-primary/10 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              <img
                src="/5.png"
                alt={t.showcase2.title}
                className="relative rounded-2xl shadow-2xl border border-white/40 w-full max-w-md lg:max-w-lg object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </FadeIn>

          {/* Text */}
          <FadeIn delay={0.2}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/8 border border-accent/20 text-accent text-sm font-semibold mb-6 tracking-wide">
              <Headphones size={14} />
              {t.showcase2.badge}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-primary leading-tight">
              {t.showcase2.title}
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t.showcase2.desc}
            </p>
            <div className="space-y-4">
              {t.showcase2.points.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles size={12} />
                  </div>
                  <p className="text-foreground/90 text-sm leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/**
 * Showcase 3 — Multi-device / Lifestyle (6.png)
 * Placed before PricingSection: shows multi-platform usage
 */
export function ShowcaseMultiPlatform() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background" />
      <DotPattern className="text-primary" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/8 border border-blue-500/20 text-blue-500 text-sm font-semibold mb-6 tracking-wide">
            <Smartphone size={14} />
            {t.showcase3.badge}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight text-primary leading-tight">
            {t.showcase3.title}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.showcase3.desc}
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="max-w-5xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-accent/10 to-blue-500/10 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
            <img
              src="/6.png"
              alt={t.showcase3.title}
              className="relative rounded-2xl shadow-2xl border border-white/40 w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        </FadeIn>

        {/* Feature pills below image */}
        <FadeIn delay={0.4}>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {t.showcase3.tags.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm border border-primary/15 text-sm font-medium text-foreground/80 shadow-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
