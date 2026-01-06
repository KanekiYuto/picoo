'use client';

import { useGeneratorStore } from '@/store/useGeneratorStore';
import { Link } from '@i18n/routing';
import { Button } from '@/components/ui/button';

interface HeroActionsProps {
  primaryCta: string;
  secondaryCta: string;
}

export default function HeroActions({ primaryCta, secondaryCta }: HeroActionsProps) {
  const { openGeneratorModal } = useGeneratorStore();

  return (
    <div className="flex gap-4 pt-4">
      <Button onClick={openGeneratorModal} variant="gradient" size="lg">
        {primaryCta}
      </Button>
      <Button asChild variant="secondary" size="lg" className="bg-muted/20 hover:bg-muted/30">
        <Link href="/pricing">
          {secondaryCta}
        </Link>
      </Button>
    </div>
  );
}
