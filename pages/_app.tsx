// pages/_app.tsx
import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '@/context/NavbarContext';
import { AudioProvider } from '../context/AudioContext';
import { YouTubeAPIProvider } from '../components/media/YouTubeAPIProvider';
import * as FontAwesome from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { SiteSettings, SanityImage } from '../types/sanity';
import { urlFor } from '../lib/client';
import Head from 'next/head';

FontAwesome.config.autoAddCss = false;
FontAwesome.library.add(faUser, faShoppingCart);

interface PageProps {
  siteSettings?: SiteSettings;
  metaTitle?: string;
  metaDescription?: string;
  preview?: boolean;
  canonicalUrl?: string;
}

interface SanityAsset {
  _ref?: string;
  url?: string;
  metadata?: {
    dimensions?: {
      width: number;
      height: number;
      aspectRatio: number;
    };
  };
}

interface SanityImageWithAsset {
  _type: string;
  asset: SanityAsset;
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

  // Helper function to safely get image URL
  const getImageUrl = (image: any): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (image.asset?.url) return image.asset.url;
    return '';
  };

  // Create properly typed image objects with required _type
  const faviconImage: SanityImageWithAsset = {
    _type: 'image',
    asset: {
      url: settings?.favicon?.asset?.url || '/favicon.ico'
    }
  };

  const logoImage: SanityImageWithAsset = {
    _type: 'image',
    asset: {
      url: settings?.navbar?.logo?.asset?.url || '/logo.png'
    }
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="icon"
          type="image/x-icon"
          href={getImageUrl(faviconImage)}
        />
        <title>{settings?.seo?.metaTitle || 'All7s'}</title>
        <meta
          name="description"
          content={settings?.seo?.metaDescription || ''}
        />
      </Head>

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
