import { HeroSection } from './components/HeroSection';
import { TrendingMarquee } from './components/TrendingMarquee';
import { FeaturesSection } from './components/FeaturesSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#080808] overflow-x-clip">
      <HeroSection />
      <TrendingMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
