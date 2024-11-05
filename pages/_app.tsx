// pages/_app.tsx
import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '../context/NavbarContext';
import { AudioProvider } from '../context/AudioContext';
import { YouTubeAPIProvider } from '../components/media/YouTubeAPIProvider';
import * as FontAwesome from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { SiteSettings, SanityImage } from '../types/sanity';
import { urlFor } from '../lib/client';

FontAwesome.config.autoAddCss = false;
FontAwesome.library.add(faUser, faShoppingCart);

interface PageProps {
  siteSettings?: SiteSettings;
  metaTitle?: string;
  metaDescription?: string;
  preview?: boolean;
  canonicalUrl?: string;
}

function MyApp({ Component, pageProps }: AppProps<PageProps>) {
  useEffect(() => {
    const fixedHighZIndexElement = document.querySelector('div[style*="z-index: 9999"]');
    if (fixedHighZIndexElement) {
      fixedHighZIndexElement.remove();
    }

    if (process.env.NODE_ENV !== 'production') {
      console.warn = () => {};
    }
  }, []);

  const settings = pageProps.siteSettings;

  // Helper function to get image URL
  const getImageUrl = (image: SanityImage | null | undefined): string => {
    if (!image?.asset?._ref) return '';
    return urlFor(image).url() || '';
  };

  return (
    <>
      <SEO
        title={pageProps?.metaTitle || pageProps?.siteSettings?.seo?.metaTitle}
        description={pageProps?.metaDescription || pageProps?.siteSettings?.seo?.metaDescription}
        faviconUrl={getImageUrl(settings?.favicon)}
        openGraphImageUrl={getImageUrl(settings?.seo?.openGraphImage)}
        siteName={pageProps?.siteSettings?.title}
        canonicalUrl={pageProps.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://all7z.com'}
      />

      <StateContext>
        <NavbarProvider>
          <AudioProvider>
            <YouTubeAPIProvider>
              <Layout settings={settings}>
                <Toaster />
                <Component {...pageProps} />
              </Layout>
            </YouTubeAPIProvider>
          </AudioProvider>
        </NavbarProvider>
      </StateContext>
    </>
  );
}

export default MyApp;
