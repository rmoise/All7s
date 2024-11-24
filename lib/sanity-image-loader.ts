interface ImageLoaderProps {
  src: string
  width: number
  quality?: number
}

export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src?.includes('cdn.sanity.io')) {
    return src;
  }

  const params = [`w=${width}`];
  if (quality) {
    params.push(`q=${quality}`);
  }

  if (src.includes('?')) {
    return `${src}&${params.join('&')}`;
  }

  return `${src}?${params.join('&')}`;
}