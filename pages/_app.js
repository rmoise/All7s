// pages/_app.js
import React from 'react';
import '../styles/globals.css';
import Layout from '../components/layout/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '../context/NavbarContext.jsx';

// Font Awesome setup
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Prevent Font Awesome from adding the CSS automatically

function MyApp({ Component, pageProps, siteSettings }) {
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
          <Layout siteSettings={siteSettings}>
            <Toaster />
            <Component {...pageProps} />
          </Layout>
        </NavbarProvider>
      </StateContext>
    </>
  );
}

MyApp.getInitialProps = async () => {
  const client = require('@sanity/client').createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2022-10-29',
    useCdn: false,
  });

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
