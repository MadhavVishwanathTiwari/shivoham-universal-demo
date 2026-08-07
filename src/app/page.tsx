import HeroSection from "@/components/hero/HeroSection";

export default function Home() {
  return (
    <main className="bg-void-black min-h-screen">
      <HeroSection />

      {/*
        Placeholder for whatever follows the hero. It exists so Phase 4 has
        somewhere to scroll to — the gather animation is bound to this section
        leaving the viewport.
      */}
      <section className="border-astral-gold/15 flex min-h-[60svh] items-center justify-center border-t px-6">
        <p className="font-cinzel text-parchment-white/40 max-w-lg text-center text-lg text-balance">
          The deck is gathered. The reading begins below.
        </p>
      </section>
    </main>
  );
}
