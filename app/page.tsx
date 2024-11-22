import { getClient } from '@/lib/client'
import { Metadata } from 'next'
import HomeClient from './components/HomeClient'
import { getPreviewToken } from '@/lib/preview'
import { HomePageProps } from '@/types/page'

interface ContentBlock {
  _type: string;
  _key: string;
  headline?: string;
  description?: string;
  ctaText?: string;
  placeholderText?: string;
  formName?: string;
  notification?: {
    title?: string;
    description?: string;
    showSocialLinks?: boolean;
    socialLinksTitle?: string;
    socialLinks?: Array<{
      platform: string;
      url: string;
      color?: {
        hex?: string;
      }
    }>;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const homeData = await getClient().fetch(`*[_type == "home"][0]`)
  return {
    title: homeData?.metaTitle || 'All7Z',
    description: homeData?.metaDescription || 'Welcome to All7Z',
  }
}

export default async function HomePage(
  props: HomePageProps
): Promise<JSX.Element> {
  const searchParams = await props.searchParams;
  const preview = searchParams?.preview === '1'
  const token = await getPreviewToken()
  const isPreview = Boolean(preview && token)

  console.log('Preview Debug:', {
    searchParams,
    preview,
    hasToken: !!token,
    tokenLength: token?.length,
    isPreview
  })

  const client = getClient(isPreview)

  try {
    const homeData = await client.fetch(`
      *[_type == "home" && (_id == "drafts.singleton-home" || _id == "singleton-home")] | order(_id desc)[0] {
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
              listenTitle,
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
              formName,
              notification {
                title,
                description,
                showSocialLinks,
                socialLinksTitle,
                socialLinks[] {
                  platform,
                  url,
                  color {
                    hex
                  }
                }
              }
            }
          )
        }
      }
    `, undefined, {
      cache: isPreview ? 'no-store' : 'force-cache',
      next: { tags: ['home'] }
    })

    const newsletterBlock = homeData?.contentBlocks?.find((block: ContentBlock) => block._type === 'newsletter')
    console.log('Newsletter Block:', {
      hasNewsletter: !!newsletterBlock,
      notification: newsletterBlock?.notification,
      headline: newsletterBlock?.headline
    })

    console.log('Query Result:', {
      hasData: !!homeData,
      id: homeData?._id,
      blockCount: homeData?.contentBlocks?.length
    })

    if (!homeData) {
      console.error('No home data found')
      return <div>No content available</div>
    }

    return (
      <>
        {isPreview && (
          <div style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            background: '#000',
            color: '#fff',
            padding: '0.5rem',
            zIndex: 100,
            borderRadius: '0.25rem'
          }}>
            Preview Mode
          </div>
        )}
        <HomeClient contentBlocks={homeData?.contentBlocks || []} />
      </>
    )
  } catch (error) {
    console.error('Error fetching home data:', error)
    return <div>Error loading page</div>
  }
}