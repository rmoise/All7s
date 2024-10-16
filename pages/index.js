// pages/index.js
import React from 'react';
import { client } from '../lib/client';
import Splash from '../components/home/Splash';
import About from '../components/home/About';
import MusicAndVideo from '../components/Music/MusicAndVideo';
import Newsletter from '../components/common/Newsletter';
import HeroBanner from '../components/home/HeroBanner';
import SEO from '../components/common/SEO';

const Home = ({ contentBlocks, metaTitle, metaDescription, siteSettings, navbarData }) => {
  const pageTitle =
    metaTitle
      ? `${metaTitle} - ${siteSettings?.title || ''}`.trim()
      : siteSettings?.seo?.metaTitle
      ? `${siteSettings.seo.metaTitle} - ${siteSettings?.title || ''}`.trim()
      : siteSettings?.title || 'Default Site Title';

  return (
    <>
      <SEO
        title={pageTitle}
        description={
          metaDescription ||
          siteSettings?.seo?.metaDescription ||
          'Explore the All 7z Brand. West Coast Music, Lifestyle, Merch'
        }
        faviconUrl={siteSettings?.favicon?.asset?.url}
        openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
        siteName={siteSettings?.title}
      />

      {contentBlocks.map((block, index) => {
        switch (block._type) {
          case 'splash':
            return <Splash key={block._key || index} {...block} />;
          case 'about':
            return <About key={block._key || index} aboutData={block} />;
          case 'musicAndVideo':
            return <MusicAndVideo key={block._key || index} videoPreLink={block} />;
          case 'newsletter':
            return <Newsletter key={block._key || index} newsletter={block} />;
          case 'heroBanner':
            return <HeroBanner key={block._key || index} heroBanner={block} />;
          default:
            return null;
        }
      })}
    </>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const homePageQuery = `*[_type == "homePage"][0]{
    title,
    metaTitle,
    metaDescription,
    contentBlocks[] {
      ...,
      _type == 'musicAndVideo' => {
        lookTitle,
        listenTitle,
        vidLink,
        heroLink,
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
          customImage {
            asset-> {
              url
            }
          },
          songs[] {
            trackTitle,
            file {
              asset-> {
                url
              }
            }
          }
        }
      }
    }
  }`;

  const siteSettingsQuery = `*[_type == "siteSettings"][0]{
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
    }
  }`;

  const navbarQuery = `*[_type == "navbar"][0]{
    logo,
    navigationLinks,
    backgroundColor,
    isTransparent
  }`;

  const homePage = await client.fetch(homePageQuery);
  const siteSettings = await client.fetch(siteSettingsQuery);
  const navbarData = await client.fetch(navbarQuery);

  // Extracting the LOOK and LISTEN titles to be added to navigationLinks
  let updatedNavbarData = { ...navbarData };
  updatedNavbarData.navigationLinks = [...(navbarData.navigationLinks || [])];

  const musicAndVideoSection = homePage?.contentBlocks?.find(block => block._type === 'musicAndVideo');
  if (musicAndVideoSection) {
    if (musicAndVideoSection.lookTitle) {
      updatedNavbarData.navigationLinks.push({ name: musicAndVideoSection.lookTitle, href: '/#LOOK' });
    }
    if (musicAndVideoSection.listenTitle) {
      updatedNavbarData.navigationLinks.push({ name: musicAndVideoSection.listenTitle, href: '/#LISTEN' });
    }
  }

  return {
    props: {
      contentBlocks: homePage?.contentBlocks || [],
      metaTitle: homePage?.metaTitle || null,
      metaDescription: homePage?.metaDescription || null,
      siteSettings: siteSettings || null,
      navbarData: updatedNavbarData || null,
    },
  };
};
