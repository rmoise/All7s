import React from 'react';
import PropTypes from 'prop-types';
import { client } from '../lib/client';
import Splash from '../components/home/Splash';
import About from '../components/home/About';
import MusicBlock from '../components/blocks/MusicBlock';
import VideoBlock from '../components/blocks/VideoBlock';
import BackgroundVideoBlock from '../components/blocks/BackgroundVideoBlock';
import Newsletter from '../components/common/Newsletter';
import HeroBanner from '../components/home/HeroBanner';
import SEO from '../components/common/SEO';
import Script from 'next/script';

const Home = ({ contentBlocks, metaTitle, metaDescription, siteSettings }) => {
  console.log("Received siteSettings in Home component:", siteSettings); // Debugging log for siteSettings

  const pageTitle = metaTitle?.trim()
    ? `${metaTitle} - ${siteSettings?.title || ''}`
    : `${siteSettings?.seo?.metaTitle?.trim() || 'Default Site Title'} - ${siteSettings?.title || ''}`;

  return (
    <>
      {siteSettings && (
        <SEO
          title={pageTitle}
          description={metaDescription || siteSettings?.seo?.metaDescription || 'Explore the All 7z Brand. West Coast Music, Lifestyle, Merch'}
          faviconUrl={siteSettings?.favicon?.asset?.url || '/favicon.ico'}
          openGraphImageUrl={siteSettings?.seo?.openGraphImage?.asset?.url}
          siteName={siteSettings?.title}
        />
      )}
      {contentBlocks.map((block, index) => {
        const key = block._key || `${block._type}-${index}`;
        switch (block._type) {
          case 'splash':
            return <Splash key={key} {...block} />;
          case 'about':
            return <About key={key} aboutData={block} />;
          case 'musicBlock':
            return <MusicBlock key={key} listenTitle={block.listenTitle} albums={block.albums || []} />;
          case 'videoBlock':
            return <VideoBlock key={key} lookTitle={block.lookTitle} heroVideoLink={block.heroVideoLink} additionalVideos={block.additionalVideos || []} />;
          case 'backgroundVideoBlock':
            return <BackgroundVideoBlock key={key} backgroundVideoUrl={block.backgroundVideoUrl} backgroundVideoFile={block.backgroundVideoFile} posterImage={block.posterImage} />;
          case 'newsletter':
            return <Newsletter key={key} newsletter={block} />;
          case 'heroBanner':
            return <HeroBanner key={key} heroBanner={block} />;
          default:
            return null;
        }
      })}
      <Script src="https://www.youtube.com/iframe_api" strategy="beforeInteractive" />
    </>
  );
};

Home.propTypes = {
  contentBlocks: PropTypes.arrayOf(PropTypes.object).isRequired,
  metaTitle: PropTypes.string,
  metaDescription: PropTypes.string,
  siteSettings: PropTypes.object,
};

export default Home;


export const getStaticProps = async () => {
  const homePageQuery = `*[_type == "home"][0]{
    title,
    metaTitle,
    metaDescription,
    openGraphImage,
    contentBlocks[] {
      ...,
      _type == 'musicBlock' => {
        listenTitle,
        albums[]-> {
          _id,
          albumSource,
          embeddedAlbum {
            embedUrl,
            title,
            artist,
            platform,
            releaseType,
            imageUrl,
            customImage {
              asset-> { url }
            }
          },
          customAlbum {
            title,
            artist,
            releaseType,
            customImage {
              asset-> { url }
            },
            songs[] {
              trackTitle,
              "url": file.asset->url,
              duration
            }
          }
        }
      },
      _type == 'videoBlock' => {
        lookTitle,
        heroVideoLink,
        additionalVideos
      },
      _type == 'backgroundVideoBlock' => {
        backgroundVideoUrl,
        backgroundVideoFile { asset-> { url } },
        posterImage { asset-> { url } }
      }
    }
  }`;

  const siteSettingsQuery = `*[_type == "settings"][0]{
    title,
    favicon { asset-> { url, _updatedAt } },
    seo { metaTitle, metaDescription, openGraphImage { asset-> { url } } },
    navbar { logo, navigationLinks, backgroundColor, isTransparent },
    footer { copyrightText, footerLinks, socialLinks, fontColor, alignment }
  }`;

  try {
    const [homePage, siteSettings] = await Promise.all([
      client.fetch(homePageQuery),
      client.fetch(siteSettingsQuery),
    ]);

    console.log("Fetched homePage:", homePage);  // Debug fetched homePage
    console.log("Fetched siteSettings:", siteSettings || "siteSettings document not found");

    return {
      props: {
        contentBlocks: homePage?.contentBlocks || [],
        metaTitle: homePage?.metaTitle || null,
        metaDescription: homePage?.metaDescription || null,
        siteSettings: siteSettings || { title: 'Default Site', seo: { metaTitle: 'Default Title', metaDescription: 'Default description' } }, // Safe fallback
      },
      revalidate: 10,
    };
  } catch (error) {
    console.error("Error fetching data:", error.message);

    return {
      props: {
        contentBlocks: [],
        metaTitle: null,
        metaDescription: null,
        siteSettings: { title: 'Default Site', seo: { metaTitle: 'Default Title', metaDescription: 'Default description' } },
      },
    };
  }
};
