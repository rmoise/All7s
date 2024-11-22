import { getClient, previewClient } from './client'

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

// Add cache at the top of the file
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const queryCache = new Map<string, { data: any; timestamp: number }>()

async function fetchWithRetry<T>(query: string, preview = false, maxRetries = 3): Promise<T | null> {
  const sanityClient = getClient(preview)

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to fetch data...`)
      const result = await sanityClient.fetch<T>(query, {}, {
        cache: 'no-store' // Disable caching for troubleshooting
      })
      console.log('Fetch successful:', !!result)
      return result
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
        preview,
        hasToken: !!sanityClient.config().token,
        query
      })

      if (attempt === maxRetries) {
        console.error('Max retries reached, returning null')
        return null
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
      console.log(`Waiting ${delay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return null
}

export async function getHome(preview = false): Promise<HomeData | null> {
  try {
    const client = preview ? previewClient : getClient(preview)

    // Modified query to explicitly handle drafts
    const query = `*[_type == "home" && (_id == "singleton-home" || _id == "drafts.singleton-home")] | order(_id desc)[0] {
      _id,
      _type,
      contentBlocks[] {
        _type,
        _key,
        "musicBlock": select(
          _type == 'musicBlock' => {
            listenTitle,
            "albums": coalesce(
              *[_type == "album" && _id in ^.albums[]._ref][],
              *[_type == "album" && _id in ^.albums[]._ref && _id match "drafts.*"][]
            )
          }
        ),
        "videoBlock": select(
          _type == 'videoBlock' => {
            lookTitle,
            heroVideoLink
          }
        )
      }
    }`

    console.log('Preview state:', {
      preview,
      hasToken: !!client.config().token,
      tokenLength: client.config().token?.length,
      perspective: client.config().perspective
    })

    const result = await client.fetch(query, undefined, {
      cache: preview ? 'no-store' : 'force-cache',
      next: { tags: ['home'] }
    })

    return result
  } catch (error) {
    console.error('Error fetching home data:', error)
    return null
  }
}
