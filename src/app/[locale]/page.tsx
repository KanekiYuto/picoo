'use client';

import { Hero } from '@/components/rootPage/Hero';
import { ModelsShowcase } from '@/components/rootPage/ModelsShowcase';
import { CTA } from '@/components/rootPage/CTA';
import { Pricing } from '@/components/pricing/Pricing';
import { Footer } from '@/components/layout';
import { RootPageHeader } from '@/components/rootPage/RootPageHeader';

export default function Home() {
  return (
    <>
      {/* Fixed Header */}
      <RootPageHeader />

      <Hero />

      {/* Main Content */}
      <div className="flex flex-col gap-16 md:gap-32 lg:gap-48">
        <ModelsShowcase />
        <div className='px-4 md:px-6 lg:px-8'>
          <Pricing />
        </div>
        <CTA />
        <Footer />
      </div>
    </>
  );
}

