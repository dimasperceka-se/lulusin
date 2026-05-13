import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Headphones, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.features, href: "#fitur" },
    { name: t.nav.pricing, href: "#harga" },
    { name: t.nav.community, href: "#testimoni" },
    { name: t.nav.download, href: "#download" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass-nav py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-2 rounded-lg text-primary group-hover:bg-primary/40 transition-colors duration-300">
              <Headphones size={24} strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">Storify</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={() => setLang(lang === "id" ? "en" : "id")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 text-sm font-bold text-primary hover:bg-primary/5 transition-all duration-200"
              title={lang === "id" ? "Switch to English" : "Ganti ke Indonesia"}
            >
              <Globe size={14} />
              {lang === "id" ? "EN" : "ID"}
            </button>
            <a href="https://app.storify.asia/auth/signin" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="font-medium text-muted-foreground hover:text-foreground">
                {t.nav.login}
              </Button>
            </a>
            <a href="https://app.storify.asia/auth/signin" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white font-bold shadow-lg shadow-accent/30">
                {t.nav.startFree}
              </Button>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-card border-x-0 border-t-0 mt-3"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-white/5"
                >
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-border my-2" />
              {/* Language Toggle - Mobile */}
              <button
                onClick={() => setLang(lang === "id" ? "en" : "id")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/20 text-sm font-bold text-primary hover:bg-primary/5 transition-all duration-200 w-full justify-center"
              >
                <Globe size={14} />
                {lang === "id" ? "Switch to English" : "Ganti ke Indonesia"}
              </button>
              <a href="https://app.storify.asia/auth/signin" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="ghost" className="justify-start w-full">{t.nav.login}</Button>
              </a>
              <a href="https://app.storify.asia/auth/signin" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-600 text-white w-full">{t.nav.startFree}</Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
