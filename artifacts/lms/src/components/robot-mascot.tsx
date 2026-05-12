import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface RobotMascotProps {
  className?: string;
}

export function RobotMascot({ className }: RobotMascotProps) {
  return (
    <section className={cn("relative overflow-hidden py-12 md:py-16", className)}>
      <div className="container mx-auto max-w-6xl px-4">
        <div className="relative rounded-3xl bg-gradient-to-br from-primary/10 via-mint-50 to-blue-50 dark:from-primary/20 dark:via-primary/10 dark:to-background border border-primary/15 p-6 md:p-10 overflow-hidden">
          {/* Decorative animated glows */}
          <motion.div
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.6, 0.3, 0.6] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Floating sparkles around robot */}
          <motion.div
            className="absolute top-12 left-12 text-primary/70 pointer-events-none hidden md:block"
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5], rotate: [0, 15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <motion.div
            className="absolute bottom-16 left-48 text-accent pointer-events-none hidden md:block"
            animate={{ y: [0, 12, 0], opacity: [0.4, 0.9, 0.4], rotate: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-72 text-primary/50 pointer-events-none hidden lg:block"
            animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Sparkles className="h-3 w-3" />
          </motion.div>

          <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 items-center">
            {/* Animated robot */}
            <motion.div
              className="flex justify-center md:justify-start"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <motion.img
                src="/robot_pns.png"
                alt="Robot PNS Lulusin"
                className="h-64 md:h-80 lg:h-96 w-auto object-contain drop-shadow-xl select-none"
                style={{ mixBlendMode: "multiply" }}
                animate={{
                  y: [0, -14, 0],
                  rotate: [-1.5, 1.5, -1.5],
                }}
                transition={{
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                }}
                whileHover={{ scale: 1.05 }}
                draggable={false}
              />
            </motion.div>

            {/* Speech bubble + CTA */}
            <div className="flex flex-col items-start gap-5">
              <motion.div
                className="relative bg-white dark:bg-card rounded-3xl px-6 py-5 md:px-8 md:py-6 shadow-lift border border-border max-w-xl"
                initial={{ opacity: 0, x: -30, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              >
                {/* Tail pointing left to the robot */}
                <div className="hidden md:block absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rotate-45 bg-white dark:bg-card border-l border-b border-border" />

                <motion.div
                  className="flex items-start gap-2 mb-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">
                    Cek Peluang Lulus
                  </span>
                </motion.div>
                <p className="text-lg md:text-xl font-semibold leading-snug text-foreground">
                  Yuk ikutin Pre Test untuk cek seberapa besar peluang kamu lulus SKD CPNS!
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Cuma 15 soal · 5 TWK + 5 TIU + 5 TKP · gratis · tanpa daftar
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Button size="lg" className="text-base font-semibold h-12 shadow-glow group" asChild>
                  <Link href="/pre-test">
                    Mulai Test{" "}
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.span>
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
