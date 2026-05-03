import { HeroSection } from './components/HeroSection';
import { TrendingMarquee } from './components/TrendingMarquee';
import { BentoSection } from './components/BentoSection';
import { Footer } from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-[#141414] overflow-x-hidden">
      <HeroSection />
      <TrendingMarquee />
      <BentoSection />
      <Footer />
    </main>
  );
}
