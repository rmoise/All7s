// pages/index.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { getClient, getSanitySettings } from '@/lib/client';
import type { SiteSettings } from '@/types/sanity';
import MusicBlock from '@/components/blocks/MusicBlock';
import VideoBlock from '@/components/blocks/VideoBlock';
import BackgroundVideoBlock from '@/components/blocks/BackgroundVideoBlock';
import HeroBanner from '@/components/home/HeroBanner';
import About from '@/components/home/About';
import Newsletter from '@/components/common/Newsletter';

interface HomeProps {
  siteSettings: SiteSettings | null;
  contentBlocks: any[];
  metaTitle: string;
  metaDescription: string;
  preview: boolean;
}

export default function Home({ siteSettings, contentBlocks, metaTitle, metaDescription, preview }: HomeProps) {
  const renderContentBlock = (block: any) => {
    switch (block._type) {
      case 'musicBlock':
        return (
          <MusicBlock
            key={block._key}
            listenTitle={block.title}
            albums={block.albums}
          />
        );
      case 'videoBlock':
        return (
          <VideoBlock
            key={block._key}
            lookTitle={block.lookTitle}
            heroVideoLink={block.heroVideoLink}
            additionalVideos={block.additionalVideos}
          />
        );
      case 'backgroundVideoBlock':
        return (
          <BackgroundVideoBlock
            key={block._key}
            backgroundVideoUrl={block.backgroundVideoUrl}
            backgroundVideoFile={block.backgroundVideoFile}
            posterImage={block.posterImage}
          />
        );
      case 'heroBanner':
        return (
          <HeroBanner
            key={block._key}
            backgroundImage={block.backgroundImage}
            smallText={block.smallText}
            midText={block.midText}
            largeText1={block.largeText1}
            ctaText={block.cta?.text}
            ctaLink={block.cta?.link}
          />
        );
      case 'about':
        return (
          <About
            key={block._key}
            body={block.body}
            image={block.image}
            alignment={block.alignment}
          />
        );
      case 'newsletter':
        return (
          <Newsletter
            key={block._key}
            newsletter={block}
          />
        );
      default:
        console.warn(`Unknown block type: ${block._type}`);
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>{metaTitle || 'All7s'}</title>
        <meta name="description" content={metaDescription || 'Welcome to All7s'} />
      </Head>

      <main className="relative min-h-screen bg-black">
        {contentBlocks?.map(block => renderContentBlock(block))}
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  try {
    const { preview = false, previewData = {} } = context;
    const client = getClient(preview);

    const documentId = preview
      ? (previewData as any).id || 'drafts.singleton-home'
      : 'singleton-home';

    const [settings, homeData] = await Promise.all([
      getSanitySettings(preview),
      client.fetch(`
        *[_type == "home" && _id == $id][0] {
          _id,
          _type,
          title,
          metaTitle,
          metaDescription,
          contentBlocks[] {
            _key,
            _type,
            ...select(
              _type == 'musicBlock' => {
                title,
                description,
                "albums": albums[]->
              },
              _type == 'videoBlock' => {
                lookTitle,
                heroVideoLink,
                additionalVideos
              },
              _type == 'backgroundVideoBlock' => {
                backgroundVideoUrl,
                backgroundVideoFile,
                posterImage
              },
              _type == 'heroBanner' => {
                backgroundImage,
                smallText,
                midText,
                largeText1,
                cta
              },
              _type == 'about' => {
                body,
                image,
                alignment
              },
              _type == 'newsletter' => {
                headline,
                description,
                ctaText,
                placeholderText,
                formName
              }
            )
          }
        }
      `, { id: documentId })
    ]);

    if (!homeData) {
      console.error('No home data found');
      return {
        props: {
          siteSettings: settings || null,
          contentBlocks: [],
          metaTitle: '',
          metaDescription: '',
          preview
        }
      };
    }

    return {
      props: {
        siteSettings: settings,
        contentBlocks: homeData.contentBlocks || [],
        metaTitle: homeData.metaTitle || '',
        metaDescription: homeData.metaDescription || '',
        preview
      },
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      props: {
        siteSettings: null,
        contentBlocks: [],
        metaTitle: '',
        metaDescription: '',
        preview: false
      }
    };
  }
};


