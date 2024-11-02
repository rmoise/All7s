// pages/index.tsx
import React from 'react';
import PropTypes from 'prop-types';
import { client } from '@lib/client'; // Correct import path
import SEO from '../components/common/SEO';
import Splash from '../components/home/Splash';
import About from '../components/home/About';
import MusicBlock from '../components/blocks/MusicBlock';
import VideoBlock from '../components/blocks/VideoBlock';
import BackgroundVideoBlock from '../components/blocks/BackgroundVideoBlock';
import Newsletter from '../components/common/Newsletter';
import HeroBanner from '../components/home/HeroBanner';
import Script from 'next/script';
import { GetServerSideProps } from 'next';
import { safeFetch, getServerClient, urlFor } from '../lib/sanityClient.server';


// Existing interfaces
interface SiteSettings {
  // ... existing SiteSettings interface ...
}

interface HomeProps {
  // ... existing HomeProps interface ...
}

// New interfaces for content blocks
interface Song {
  trackTitle: string
  url: string
  duration: number
}

interface CustomAlbum {
  title: string
  artist: string
  releaseType: string
  customImage?: {
    asset?: {
      url: string
    }
  }
  songs: Song[]
}

interface EmbeddedAlbum {
  embedUrl: string
  title: string
  artist: string
  platform: string
  releaseType: string
  imageUrl: string
  customImage?: {
    asset?: {
      url: string
    }
  }
}

interface Album {
  _id: string
  albumSource: string
  embeddedAlbum?: EmbeddedAlbum
  customAlbum?: CustomAlbum
}

interface MusicBlock {
  _type: 'musicBlock'
  _key: string
  listenTitle: string
  albums: Album[]
}

interface VideoBlock {
  _type: 'videoBlock'
  _key: string
  lookTitle: string
  heroVideoLink: string
  additionalVideos: string[]
}

interface BackgroundVideoBlock {
  _type: 'backgroundVideoBlock'
  _key: string
  backgroundVideoUrl?: string
  backgroundVideoFile?: {
    asset?: {
      url: string
    }
  }
  posterImage?: {
    asset?: {
      url: string
    }
  }
}

interface SplashBlock {
  _type: 'splash'
  _key: string
  [key: string]: any // Add specific properties as needed
}

interface AboutBlock {
  _type: 'about'
  _key: string
  [key: string]: any // Add specific properties as needed
}

interface NewsletterBlock {
  _type: 'newsletter'
  _key: string
  [key: string]: any // Add specific properties as needed
}

interface HeroBannerBlock {
  _type: 'heroBanner'
  _key: string
  [key: string]: any // Add specific properties as needed
}

type ContentBlock =
  | SplashBlock
  | AboutBlock
  | MusicBlock
  | VideoBlock
  | BackgroundVideoBlock
  | NewsletterBlock
  | HeroBannerBlock

// Update HomeProps to use the new ContentBlock type
interface HomeProps {
  contentBlocks: ContentBlock[]
  metaTitle?: string
  metaDescription?: string
  siteSettings?: SiteSettings
  preview: boolean
}

// Add HomePage interface
interface HomePage {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: {
    asset?: {
      url: string;
    };
  };
  contentBlocks: ContentBlock[];
}

// Define interfaces for your props
interface HomePageProps {
  contentBlocks: any[]; // Replace 'any' with the actual type if known
  metaTitle: string;
  metaDescription: string;
  siteSettings: any; // Replace 'any' with the actual type if known
  preview: boolean;
}

// Define the type for the block if known
type BlockType = any; // Replace 'any' with the actual type if known

const Home = ({ contentBlocks, metaTitle, metaDescription, siteSettings, preview }: HomePageProps) => {
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
          canonicalUrl="https://yourdomain.com" // Optional: Set your canonical URL
        />
      )}
      {contentBlocks.map((block: BlockType, index: number) => {
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
  preview: PropTypes.bool,
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const preview = context.preview ?? false;
  const client = getServerClient(preview);

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

  const settingsQuery = `*[_type == "settings"][0]{
    title,
    favicon { asset-> { url, _updatedAt } },
    seo { metaTitle, metaDescription, openGraphImage { asset-> { url } } },
    navbar { logo, navigationLinks, backgroundColor, isTransparent },
    footer {
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
    // Update the safeFetch calls with proper typing
    const [homePage, siteSettings] = await Promise.all([
      safeFetch<HomePage>(homePageQuery),
      safeFetch<SiteSettings>(settingsQuery),
    ]);

    console.log("Fetched homePage:", homePage);
    console.log("Fetched siteSettings:", siteSettings || "siteSettings document not found");

    return {
      props: {
        preview,
        contentBlocks: homePage?.contentBlocks || [],
        metaTitle: homePage?.metaTitle || null,
        metaDescription: homePage?.metaDescription || null,
        siteSettings: siteSettings || {
          title: 'Default Site',
          seo: {
            metaTitle: 'Default Title',
            metaDescription: 'Default description'
          }
        },
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      props: {
        preview,
        contentBlocks: [],
        metaTitle: null,
        metaDescription: null,
        siteSettings: {
          title: 'Default Site',
          seo: {
            metaTitle: 'Default Title',
            metaDescription: 'Default description'
          }
        },
      },
    };
  }
};

export default Home;
