import { Backdrop } from "@/components/Backdrop";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Console } from "@/components/console/Console";
import { StatLine } from "@/components/StatLine";
import { AgentsWorkflow } from "@/components/AgentsWorkflow";
import { DataViz } from "@/components/viz/DataViz";
import { Features } from "@/components/Features";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Backdrop />
      <Nav />
      <main id="top">
        <Hero />
        <Console />
        <StatLine />
        <AgentsWorkflow />
        <hr className="divider" />
        <DataViz />
        <hr className="divider" />
        <Features />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
