// pages/_app.js
import React, { useEffect } from 'react';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '../context/NavbarContext';
import { AudioProvider } from '../context/AudioContext';
import { YouTubeAPIProvider } from '../components/media/YouTubeAPIProvider';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import { client } from '../lib/client';

function MyApp({ Component, pageProps, siteSettings }) {
  useEffect(() => {
    // Target and remove the fixed high-z-index element if it exists
    const fixedHighZIndexElement = document.querySelector('div[style*="z-index: 9999"]');
    if (fixedHighZIndexElement) {
      fixedHighZIndexElement.remove();
    }
  }, []);

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

MyApp.getInitialProps = async () => {
  const query = `*[_type == "settings"][0]{
    title,
    favicon{
      asset->{
        url,
        _updatedAt
      }
    },
    seo{
      metaTitle,
      metaDescription,
      openGraphImage{
        asset->{
          url
        }
      }
    },
    navbar{
      logo,
      navigationLinks[]{
        name,
        href
      },
      backgroundColor,
      isTransparent
    },
    footer{
      copyrightText,
      footerLinks[]{
        text,
        url
      },
      socialLinks[]{
        platform,
        url,
        iconUrl
      },
      fontColor,
      alignment
    }
  }`;

  try {
    const siteSettings = await client.fetch(query);
    return { siteSettings };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return { siteSettings: null };
  }
};

export default MyApp;
