import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection, SocialProofSection } from "@/components/sections/HeroSection";
import { HowItWorksSection, FeaturesSection } from "@/components/sections/ValuePropSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ShowcaseBrowse, ShowcaseListen, ShowcaseMultiPlatform } from "@/components/sections/AppShowcaseSection";
import { WaitlistSection } from "@/components/sections/WaitlistSection";
import { 
  PalestineDonationSection, 
  TestimonialsSection, 
  FAQSection, 
  CTASection 
} from "@/components/sections/CommunitySection";
import { FlowingRibbons } from "@/components/BackgroundDecorations";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-background to-primary/[0.02] text-foreground selection:bg-primary/30 relative">
      <FlowingRibbons />
      <Navbar />
      
      <main>
        <HeroSection />
        <SocialProofSection />
        <HowItWorksSection />
        <ShowcaseBrowse />
        <FeaturesSection />
        <ShowcaseListen />
        <ShowcaseMultiPlatform />
        <PricingSection />
        <WaitlistSection />
        <PalestineDonationSection />
        <TestimonialsSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
