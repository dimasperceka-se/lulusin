import { Headphones, Twitter, Instagram, Youtube, Music } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gradient-to-b from-white/40 to-primary/[0.03] pt-20 pb-10 border-t border-border/40 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <div className="absolute bottom-20 -right-32 w-64 h-64 bg-accent/[0.03] rounded-full blur-[100px]" />
      <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/[0.03] rounded-full blur-[100px]" />
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="bg-accent/15 p-2.5 rounded-lg text-accent">
                <Headphones size={24} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight text-primary">Storify</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Youtube size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Music size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.product}</h4>
            <ul className="space-y-4">
              {t.footer.productLinks.map((link, i) => (
                <li key={i}><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">{link}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.company}</h4>
            <ul className="space-y-4">
              {t.footer.companyLinks.map((link, i) => (
                <li key={i}><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">{link}</a></li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6">{t.footer.legal}</h4>
            <ul className="space-y-4">
              {t.footer.legalLinks.map((link, i) => (
                <li key={i}><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="pt-10 border-t border-border/40 text-center">
          <p className="text-muted-foreground text-sm">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
