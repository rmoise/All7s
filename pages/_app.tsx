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
import { SanityLive } from '@lib/live';

FontAwesome.config.autoAddCss = false;
FontAwesome.library.add(faUser, faShoppingCart);

interface SiteSettings {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: {
      asset?: {
        url?: string;
      };
    };
  };
  favicon?: {
    asset?: {
      url?: string;
    };
  };
  title?: string;
}

interface ExtendedAppProps extends AppProps {
  pageProps: {
    siteSettings?: SiteSettings;
    metaTitle?: string;
    metaDescription?: string;
    preview?: boolean;
    canonicalUrl?: string;
  };
}

function MyApp({ Component, pageProps }: ExtendedAppProps) {
  useEffect(() => {
    const fixedHighZIndexElement = document.querySelector('div[style*="z-index: 9999"]');
    if (fixedHighZIndexElement) {
      fixedHighZIndexElement.remove();
    }
  }, []);

  const { siteSettings } = pageProps;

  if (!siteSettings) {
    return <div>Loading site settings...</div>;
  }

  return (
    <>
      <SEO
        title={pageProps?.metaTitle || siteSettings?.seo?.metaTitle}
        description={pageProps?.metaDescription || siteSettings?.seo?.metaDescription}
        faviconUrl={siteSettings?.favicon?.asset?.url || '/favicon.ico'}
        openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
        siteName={siteSettings?.title}
        canonicalUrl={pageProps.canonicalUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://all7z.com'}
      />

      <StateContext>
        <NavbarProvider>
          <AudioProvider>
            <YouTubeAPIProvider>
              <Layout siteSettings={siteSettings}>
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
