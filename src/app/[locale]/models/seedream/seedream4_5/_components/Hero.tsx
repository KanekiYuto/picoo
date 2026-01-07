import { Check } from 'lucide-react';
import HeroActions from './HeroActions';

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
  const firstImage = images[0];

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

      {/* 右侧图片 - 使用原生 img 标签优化 LCP */}
      <div className="w-full md:col-span-2 overflow-hidden">
        {firstImage ? (
          <div className="aspect-video rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-lg">
            <img
              src={firstImage}
              alt="Hero image"
              width="1920"
              height="1080"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        ) : (
          <div className="aspect-video rounded-2xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-lg">
            {noImages}
          </div>
        )}
      </div>
    </div>
  );
}
