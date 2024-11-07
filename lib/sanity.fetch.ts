import { getClient } from './client'

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

export async function getSettings(preview = false) {
  try {
    const settings = await fetchWithRetry(`
      *[_type == "settings" && _id == "singleton-settings"][0]{
        navbar{
          logo,
          navigationLinks[]{name, href},
          backgroundColor,
          isTransparent
        }
      }
    `, preview)
    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    return null
  }
}

export async function getHome(preview = false) {
  try {
    return await fetchWithRetry(`
      *[_type == "home" && _id == ${preview ? '"drafts.singleton-home"' : '"singleton-home"'}][0]{
        contentBlocks[]{
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
  } catch (error) {
    console.error('Error fetching home:', error)
    return null
  }
}
