import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ProblemSection } from "@/components/ProblemSection";
import { ConstellationSection } from "@/components/ConstellationSection";
import { ChannelsSection } from "@/components/ChannelsSection";
import { GuaranteeSection } from "@/components/GuaranteeSection";
import { FaqSection } from "@/components/FaqSection";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Backdrop />
      <Nav />
      <main id="top">
        <Hero />
        <ProblemSection />
        <ConstellationSection />
        <ChannelsSection />
        <GuaranteeSection />
        <FaqSection />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
