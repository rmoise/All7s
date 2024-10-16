import React from 'react';
import Image from 'next/image';
import { urlFor } from '../../lib/client';

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className="relative w-full aspect-[16/9] z-10 sm:aspect-[16/9] overflow-hidden">
      {/* Maintain a consistent 16:9 aspect ratio */}
      {heroBanner?.backgroundImage && (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={urlFor(heroBanner.backgroundImage).url()}
            alt="Hero Banner Background"
            layout="fill"
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Banner Text */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <p className="font-Headline text-sm sm:text-lg md:text-xl">{heroBanner?.smallText}</p>
        <h3 className="font-Headline sm:text-2xl md:text-4xl lg:text-5xl">{heroBanner?.midText}</h3>
        <h1 className="font-Headline sm:text-4xl md:text-6xl lg:text-8xl">{heroBanner?.largeText1}</h1>

        {heroBanner?.ctaText && heroBanner?.ctaLink && (
          <a
            href={heroBanner.ctaLink}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm md:text-base"
          >
            {heroBanner.ctaText}
          </a>
        )}
      </div>
    </div>
  );
};

export default HeroBanner;
