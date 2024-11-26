import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import Image from 'next/image';
import { urlForImage } from '@lib/sanity';
import React, { useState } from 'react';
import { SanityImage } from '@types';

interface AboutProps {
  title?: string;
  description?: string;
  body: any[];
  image: SanityImage;
  alignment: 'left' | 'center' | 'right';
}

const components: Partial<PortableTextReactComponents> = {
  block: {
    normal: ({children}) => (
      <p className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-16">{children}</p>
    ),
    h1: ({children}) => (
      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold">{children}</h1>
    ),
    h2: ({children}) => (
      <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium">{children}</h3>
    ),
  },
  marks: {
    strong: ({children}) => <strong>{children}</strong>,
    em: ({children}) => <em>{children}</em>,
  },
  types: {
    image: ({value}) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="relative w-full h-48 md:h-96">
          <Image
            src={urlForImage(value)}
            alt={value.alt || ' '}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
      );
    },
  },
};

const About: React.FC<AboutProps> = (props) => {
  const alignmentClass = `text-${props.alignment}`;
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-black z-2" id="about">
      <div className="relative w-full aspect-[16/9] sm:h-auto">
        <Image
          alt="About Image"
          src={urlForImage(props.image, { width: 2048 })}
          fill
          sizes="100vw"
          priority
          placeholder="blur"
          blurDataURL={urlForImage(props.image, { width: 50, quality: 1, blur: 50 })}
          style={{ objectFit: 'cover' }}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoadingComplete={() => setImageLoaded(true)}
          unoptimized
        />
        <div
          className={`absolute inset-0 flex items-center justify-center p-2 sm:p-4 lg:p-8 ${alignmentClass} ${
            !imageLoaded ? 'bg-black' : ''
          }`}
        >
          <div className="font-Headline font-bold md:text-[3rem] lg:text-[4rem] xl:text-[5rem] text-[1.5rem] bg-gradient-to-r from-blue-300 via-pink-600 to-purple-600 bg-clip-text text-transparent max-w-full px-2 lg:px-4 xl:px-6 leading-snug sm:leading-normal sm:tracking-tight overflow-wrap break-word">
            <PortableText
              value={props.body}
              components={components}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
