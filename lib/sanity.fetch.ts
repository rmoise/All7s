import { getClient } from './client'

// Define types for the home data structure
interface ContentBlock {
  _type: string;
  listenTitle?: string;
  albums?: Album[];
  lookTitle?: string;
  heroVideoLink?: string;
  additionalVideos?: any;
}

interface Album {
  _id: string;
  albumSource: 'embedded' | 'custom';
  embeddedAlbum?: {
    embedUrl: string;
    title: string;
    artist: string;
    platform: string;
    releaseType: string;
    imageUrl?: string;
    processedImageUrl: string;
    customImage?: {
      asset: {
        url: string;
        metadata: {
          dimensions: {
            width: number;
            height: number;
          };
        };
      };
    };
  };
  customAlbum?: {
    title: string;
    artist: string;
    releaseType: string;
    customImage?: {
      asset: {
        url: string;
      };
    };
    songs: Array<{
      trackTitle: string;
      url: string;
      duration: number;
    }>;
  };
}

interface HomeData {
  contentBlocks: ContentBlock[];
}

const client = getClient()

async function fetchWithRetry<T>(query: string, preview = false, maxRetries = 3): Promise<T | null> {
  const sanityClient = getClient(preview)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sanityClient.fetch<T>(query)
      return result
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        preview,
        hasToken: !!sanityClient.config().token
      })

      if (attempt === maxRetries) return null
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
    }
  }
  return null
}

export async function getHome(preview = false): Promise<HomeData | null> {
  try {
    const result = await fetchWithRetry<HomeData>(`
      *[_type == "home" && _id == ${preview ? '"drafts.singleton-home"' : '"singleton-home"'}][0]{
        contentBlocks[]{
          ...,
          _type == 'musicBlock' => {
            "listenTitle": listenTitle,
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
                "processedImageUrl": select(
                  platform == 'soundcloud' && defined(imageUrl) =>
                    imageUrl,  // Return original URL, let Next.js handle optimization
                  defined(imageUrl) => imageUrl,
                  '/images/placeholder.png'
                ),
                customImage {
                  asset-> {
                    url,
                    metadata {
                      dimensions
                    }
                  }
                }
              },
              customAlbum {
                title,
                artist,
                releaseType,
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
          },
          _type == 'videoBlock' => {
            lookTitle,
            heroVideoLink,
            additionalVideos,
          },
        }
      }
    `, preview)

    if (!result) {
      console.error('No home data found')
      return null
    }

    if (!result.contentBlocks?.length) {
      console.warn('Home data found but no content blocks present')
    }

    // Log successful data fetch with content block count
    console.log('Home data fetched successfully:', {
      hasData: !!result,
      contentBlocksCount: result.contentBlocks?.length || 0,
      musicBlocksCount: result.contentBlocks?.filter((block: ContentBlock) => block._type === 'musicBlock').length || 0
    })

    return result
  } catch (error) {
    console.error('Error fetching home data:', {
      error,
      preview,
      timestamp: new Date().toISOString()
    })
    return null
  }
}
