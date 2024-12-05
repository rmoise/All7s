import { Metadata } from 'next'
import HomeClient from './HomeClient'
import { getPreviewToken } from '@lib/preview'
import { fetchSanity } from '@lib/sanity'
import type { HomePageProps, HomeData } from '@/types'

export async function generateMetadata(): Promise<Metadata> {
  const homeData = await fetchSanity<HomeData>(
    `*[_type == "home"][0]`,
    undefined,
    false
  )
  return {
    title: homeData?.metaTitle ?? 'All7Z',
    description: homeData?.metaDescription ?? 'Welcome to All7Z',
  }
}

export default async function HomePage(
  props: HomePageProps
): Promise<JSX.Element> {
  const searchParams = await props.searchParams
  const preview = searchParams?.preview === '1'
  const token = await getPreviewToken()
  const isPreview = Boolean(
    preview && token && process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production'
  )

  try {
    const homeData = await fetchSanity<HomeData>(
      `*[_type == "home" && (_id == "singleton-home" || _id == "drafts.singleton-home")] | order(_id desc) [0] {
        _id,
        _type,
        title,
        metaTitle,
        metaDescription,
        "contentBlocks": contentBlocks[] | order(order asc) {
          _key,
          _type,
          order,
          ...select(
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
      }`,
      undefined,
      isPreview
    )

    if (!homeData || !homeData.contentBlocks) {
      console.error('No home data found')
      return <div>No content available</div>
    }

    return <HomeClient contentBlocks={homeData.contentBlocks} />
  } catch (error) {
    console.error('Error fetching home data:', error)
    return <div>Error loading page</div>
  }
}
