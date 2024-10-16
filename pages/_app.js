// pages/_app.js
import React from 'react';
import '../styles/globals.css';
import Layout from '../components/Layout';
import { StateContext } from '../context/StateContext';
import { Toaster } from 'react-hot-toast';
import SEO from '../components/common/SEO';
import { NavbarProvider } from '../context/NavbarContext.jsx';

// Font Awesome setup
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Prevent Font Awesome from adding the CSS automatically

function MyApp({ Component, pageProps, footerData, siteSettings, navbarData }) {
  if (!siteSettings) {
    return <div>Loading site settings...</div>;
  }

  return (
    <>
      <SEO
        title={pageProps?.metaTitle}
        description={pageProps?.metaDescription || siteSettings?.seo?.metaDescription}
        faviconUrl={siteSettings?.favicon?.asset?.url}
        openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
        siteName={siteSettings?.title}
      />

      <StateContext>
        <NavbarProvider initialNavbarData={navbarData}>
          <Layout footerData={footerData}>
            <Toaster />
            <Component {...pageProps} />
          </Layout>
        </NavbarProvider>
      </StateContext>
    </>
  );
}

MyApp.getInitialProps = async () => {
  // Fetch data for footer, navbar, and site settings
  try {
    const footerQuery = `*[_type == "footer"][0]{
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
    }`;

    const navbarQuery = `*[_type == "navbar"][0]{
      logo,
      navigationLinks[]{
        name,
        href
      },
      backgroundColor,
      isTransparent
    }`;

    const siteSettingsQuery = `*[_type == "siteSettings"][0]{
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
      }
    }`;

    // Initialize the Sanity client
    const createClient = require('@sanity/client').createClient;
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2022-10-29',
      useCdn: false,
    });

    // Fetch footer, navbar, and site settings concurrently
    const [footerData, siteSettings, navbarData] = await Promise.all([
      client.fetch(footerQuery),
      client.fetch(siteSettingsQuery),
      client.fetch(navbarQuery),
    ]);

    return { footerData, siteSettings, navbarData };
  } catch (error) {
    console.error("Error fetching global data:", error);
    return { footerData: null, siteSettings: null, navbarData: null };
  }
};

export default MyApp;
