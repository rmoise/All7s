// pages/index.js
import React from 'react';
import { client } from '../lib/client';
import Splash from '../components/home/Splash';
import About from '../components/home/About';
import MusicAndVideo from '../components/Music/MusicAndVideo';
import Newsletter from '../components/common/Newsletter';
import HeroBanner from '../components/home/HeroBanner';
import SEO from '../components/common/SEO';
import Script from 'next/script';

const Home = ({ contentBlocks, metaTitle, metaDescription, siteSettings }) => {
  const pageTitle = metaTitle?.trim()
    ? `${metaTitle} - ${siteSettings?.title || ''}`
    : `${siteSettings?.seo?.metaTitle?.trim() || 'Default Site Title'} - ${siteSettings?.title || ''}`;

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription || siteSettings?.seo?.metaDescription || 'Explore the All 7z Brand. West Coast Music, Lifestyle, Merch'}
        faviconUrl={siteSettings?.favicon?.asset?.url || '/favicon.ico'}
        openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
        siteName={siteSettings?.title}
      />

      {contentBlocks.map((block, index) => {
        const key = block._key || index;
        switch (block._type) {
          case 'splash':
            return <Splash key={key} {...block} />;
          case 'about':
            return <About key={key} aboutData={block} />;
          case 'musicAndVideo':
            return <MusicAndVideo key={key} videoPreLink={block} />;
          case 'newsletter':
            return <Newsletter key={key} newsletter={block} />;
          case 'heroBanner':
            return <HeroBanner key={key} heroBanner={block} />;
          default:
            return null;
        }
      })}

      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="lazyOnload"
      />
    </>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const queries = {
    homePageQuery: `*[_type == "home"][0]{
      title,
      metaTitle,
      metaDescription,
      _updatedAt,
      contentBlocks[] {
        ...,
        _type == 'musicAndVideo' => {
          lookTitle,
          listenTitle,
          vidLink,
          heroLink,
          _updatedAt,
          backgroundVideo {
            backgroundVideoUrl,
            backgroundVideoFile {
              asset-> {
                _ref,
                url
              }
            }
          },
          musicLink[]-> {
            title,
            description,
            artist,
            embedUrl,
            _updatedAt,
            customImage {
              asset-> {
                url
              }
            },
            songs[] {
              trackTitle,
              "url": file.asset->url,
              duration
            }
          }
        }
      }
    }`,
    siteSettingsQuery: `*[_type == "settings"][0]{
      title,
      favicon {
        asset-> {
          url,
          _updatedAt
        }
      },
      seo {
        metaTitle,
        metaDescription,
        openGraphImage {
          asset-> {
            url
          }
        }
      },
      navbar {
        logo,
        navigationLinks,
        backgroundColor,
        isTransparent
      },
      footer {
        copyrightText,
        footerLinks,
        socialLinks,
        fontColor,
        alignment
      }
    }`,
  };

  try {
    const [homePage, siteSettings] = await Promise.all([
      client.fetch(queries.homePageQuery),
      client.fetch(queries.siteSettingsQuery),
    ]);

    // Extract and update navigation links with LOOK and LISTEN titles
    const updatedNavbarData = {
      ...siteSettings.navbar,
      navigationLinks: [
        ...(siteSettings.navbar.navigationLinks || []),
        ...(homePage.contentBlocks
          ?.find(block => block._type === 'musicAndVideo') || {}
        ).lookTitle ? [{ name: homePage.contentBlocks.find(block => block._type === 'musicAndVideo').lookTitle, href: '/#LOOK' }] : [],
        ...(homePage.contentBlocks
          ?.find(block => block._type === 'musicAndVideo') || {}
        ).listenTitle ? [{ name: homePage.contentBlocks.find(block => block._type === 'musicAndVideo').listenTitle, href: '/#LISTEN' }] : []
      ],
    };

    return {
      props: {
        contentBlocks: homePage?.contentBlocks || [],
        metaTitle: homePage?.metaTitle || null,
        metaDescription: homePage?.metaDescription || null,
        siteSettings: {
          ...siteSettings,
          navbar: updatedNavbarData,
        } || null,
        footerData: siteSettings?.footer || null,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);
    return {
      props: {
        contentBlocks: [],
        metaTitle: null,
        metaDescription: null,
        siteSettings: null,
        footerData: null,
      },
    };
  }
};
