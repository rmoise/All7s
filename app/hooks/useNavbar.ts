import { useRef } from 'react'

interface NavbarRefs {
  listenRef: React.RefObject<HTMLElement>;
  lookRef: React.RefObject<HTMLElement>;
  aboutRef: React.RefObject<HTMLElement>;
  newsletterRef: React.RefObject<HTMLElement>;
  heroBannerRef: React.RefObject<HTMLElement>;
  backgroundVideoRef: React.RefObject<HTMLElement>;
  musicBlockRef: React.RefObject<HTMLElement>;
  videoBlockRef: React.RefObject<HTMLElement>;
  [key: string]: React.RefObject<HTMLElement>;
}

export function useNavbar() {
  const refs = {
    listenRef: useRef<HTMLElement>(null),
    lookRef: useRef<HTMLElement>(null),
    aboutRef: useRef<HTMLElement>(null),
    newsletterRef: useRef<HTMLElement>(null),
    heroBannerRef: useRef<HTMLElement>(null),
    backgroundVideoRef: useRef<HTMLElement>(null),
    musicBlockRef: useRef<HTMLElement>(null),
    videoBlockRef: useRef<HTMLElement>(null)
  };

  return { refs };
}