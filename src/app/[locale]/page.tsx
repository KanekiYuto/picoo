"use client";

import { HeroSection } from "@/components/home/HeroSection";
import { WhatsNew } from "@/components/home/WhatsNew";

export default function Home() {
  return (
    <div className="space-y-12 md:space-y-16 py-8 md:py-12">
      {/* Hero Section */}
      <HeroSection />

      {/* What's New Section */}
      <WhatsNew />
    </div>
  );
}
