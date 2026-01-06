import { Check } from 'lucide-react';
import HeroActions from './HeroActions';
import HeroCarousel from './HeroCarousel';

interface HeroProps {
  title: string;
  description: string;
  images: string[];
  features?: string[];
  primaryCta?: string;
  secondaryCta?: string;
  noImages?: string;
}

export default function Hero({ title, description, images, features = [], primaryCta, secondaryCta, noImages }: HeroProps) {
  return (
    <div className="flex flex-col md:grid md:grid-cols-4 gap-8 lg:gap-16 items-center py-12 md:py-20">
      {/* 左侧文本 - 服务端渲染以优化 LCP */}
      <div className="space-y-6 md:col-span-2">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-primary">
            {title}
          </h1>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-black dark:text-white">
          {description}
        </h2>

        {features.length > 0 && (
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex gap-3 items-start">
                <Check className="w-5 h-5 text-[#ff3466] flex-shrink-0 mt-0.5" />
                <span className="text-gray-600 dark:text-gray-400">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {primaryCta && secondaryCta && (
          <HeroActions primaryCta={primaryCta} secondaryCta={secondaryCta} />
        )}
      </div>

      {/* 右侧轮播图 */}
      <HeroCarousel images={images} noImages={noImages || ''} />
    </div>
  );
}
