import { PortableText } from '@portabletext/react';
import Image from 'next/image';
import { urlFor } from '../../lib/client';
import React from 'react';

const components = {
  block: {
    normal: ({ children }) => <p className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-16 ">{children}</p>,
    h1: ({ children }) => <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold ">{children}</h1>,
    h2: ({ children }) => <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold ">{children}</h2>,
    h3: ({ children }) => <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium ">{children}</h3>,
  },
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
  },
};

export default function About({ aboutData }) {
  const alignmentClass = aboutData?.alignment ? `text-${aboutData.alignment}` : '';

  return (
    <section className="relative z-10 w-full overflow-hidden" id="about">
      {aboutData?.image && (
        <div className="relative w-full aspect-[16/9] sm:h-auto">
          <Image
            alt="About Image"
            src={urlFor(aboutData.image).url()}
            layout="responsive"
            width={1600}
            height={900}
            objectFit="cover"
            quality={100}
            priority
            className="w-full h-full object-cover" // Ensures it fully covers the container area
          />
          <div
            className={`absolute inset-0 flex items-center justify-center p-2 sm:p-4 lg:p-8 ${alignmentClass}`}
          >
            <div className="font-Headline font-bold md:text-[3rem] lg:text-[4rem] xl:text-[5rem] text-[1.5rem] bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 bg-clip-text text-transparent max-w-full px-2 lg:px-4 xl:px-6 leading-snug sm:leading-normal sm:tracking-tight overflow-wrap break-word">
              {aboutData?.body ? (
                <PortableText value={aboutData.body} components={components} />
              ) : (
                <p>Content not available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
