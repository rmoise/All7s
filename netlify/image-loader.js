export default function netlifyImageLoader({ src, width, quality }) {
  const params = [`w=${width}`];
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `/.netlify/images?url=${encodeURIComponent(src)}&${params.join('&')}`;
} 