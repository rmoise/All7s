import React from 'react';
import Image from 'next/image';
import { urlFor } from '@lib/sanity';
import { SanityImage } from '@types';

interface HeroBannerProps {
  backgroundImage?: SanityImage;
  smallText?: string;
  midText?: string;
  largeText1?: string;
  ctaText?: string;
  ctaLink?: string;
}

const HeroBanner: React.FC<HeroBannerProps> = ({
  backgroundImage,
  smallText,
  midText,
  largeText1,
  ctaText,
  ctaLink,
}) => {
  return (
    <div className="relative w-full aspect-[16/9] z-1 sm:aspect-[16/9] overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={urlFor(backgroundImage)}
            alt="Hero Banner Background"
            fill
            sizes="100vw"
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {smallText && <p className="font-Headline text-sm sm:text-lg md:text-xl">{smallText}</p>}
        {midText && <h3 className="font-Headline sm:text-2xl md:text-4xl lg:text-5xl">{midText}</h3>}
        {largeText1 && <h1 className="font-Headline sm:text-4xl md:text-6xl lg:text-8xl">{largeText1}</h1>}

        {ctaText && ctaLink && (
          <a
            href={ctaLink}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
          >
            {ctaText}
          </a>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
