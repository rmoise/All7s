import React, {useEffect, useRef} from 'react'
import {Stack, Card, Box, Text, Button} from '@sanity/ui'
import {
  type ObjectInputProps,
  PatchEvent,
  type FormPatch,
  set,
  unset,
  setIfMissing
} from 'sanity'
import {useClient} from 'sanity'
import imageUrlBuilder from '@sanity/image-url'
import {urlFor, type SanityImage} from '../utils/imageUrlBuilder'

// Define types we need
interface Metadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
  embedUrl: string
  isEmbedSupported: boolean
}

// Define the image type
interface SanityImageAsset {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

interface EmbeddedAlbum {
  _type: 'embeddedAlbum'
  embedCode: string
  title: string
  artist: string
  platform: string
  releaseType: string
  imageUrl: string
  embedUrl: string
  isEmbedSupported: boolean
  customImage?: SanityImageAsset
}

interface ReleaseInfoValue {
  embedCode?: string
  customImage?: SanityImageAsset
  [key: string]: any
}

// Add this function at the top level, before the ReleaseInfoInput component
const getFunctionUrl = () => {
  // Check if we're in Sanity Studio
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // For Sanity Studio in production
    if (hostname.includes('sanity.studio')) {
      return 'https://all7z.com/.netlify/functions/music-metadata';
    }

    // For local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Check if Netlify Functions are running
      return fetch('http://localhost:8888/.netlify/functions/music-metadata')
        .then(() => 'http://localhost:8888/.netlify/functions/music-metadata')
        .catch(() => 'https://all7z.com/.netlify/functions/music-metadata');
    }
  }

  // Default to production URL
  return 'https://all7z.com/.netlify/functions/music-metadata';
};

const ReleaseInfoInput = (props: ObjectInputProps) => {
  const {value = {}, onChange, readOnly, renderDefault} = props as {
    value: ReleaseInfoValue
    onChange: (patch: PatchEvent | FormPatch | FormPatch[]) => void
    readOnly?: boolean
    renderDefault?: (props: ObjectInputProps) => React.ReactElement
  }

  const embedCode = value.embedCode as string | undefined
  const isMetadataFetchedRef = useRef(false)

  const client = useClient()
  const builder = imageUrlBuilder(client)

  const handleEmbedCodeChange = (embedInput: string) => {
    let sanitizedUrl: string = embedInput
    let supportsEmbedding = false

    // Extract URL if iframe is present
    const iframeSrcMatch = embedInput.match(/<iframe.*?src=["'](.*?)["']/i)
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      sanitizedUrl = iframeSrcMatch[1]
      supportsEmbedding = true
    }

    // Further process SoundCloud URLs embedded within SoundCloud's player
    if (sanitizedUrl.includes('w.soundcloud.com/player')) {
      try {
        const urlObj = new URL(sanitizedUrl)
        const resourceUrlEncoded = urlObj.searchParams.get('url')
        if (resourceUrlEncoded) {
          sanitizedUrl = decodeURIComponent(resourceUrlEncoded)
          supportsEmbedding = true
        }
      } catch (error) {
        console.error('Error extracting URL from SoundCloud embed code:', error)
        return
      }
    }

    const detectedPlatform = sanitizedUrl.includes('spotify.com')
      ? 'spotify'
      : sanitizedUrl.includes('soundcloud.com') || sanitizedUrl.includes('api.soundcloud.com')
        ? 'soundcloud'
        : ''

    // Create initial patch with embed code
    const initialPatch = {
      _type: 'embeddedAlbum',
      embedCode: embedInput,
      embedUrl: sanitizedUrl,
      isEmbedSupported: supportsEmbedding,
      platform: detectedPlatform
    }

    // Apply the initial patch
    onChange(PatchEvent.from([
      set(initialPatch),
      value.customImage
        ? set(value.customImage, ['customImage'])
        : unset(['customImage'])
    ]))

    // If we have a valid platform, fetch metadata
    if (detectedPlatform) {
      fetchMetadata(sanitizedUrl, embedInput, detectedPlatform, supportsEmbedding)
    }
  }

  // Update fetchMetadata to accept parameters
  const fetchMetadata = async (
    sanitizedUrl: string,
    embedCode: string,
    platform: string,
    supportsEmbedding: boolean
  ) => {
    try {
      const functionUrl = getFunctionUrl();
      console.log('Metadata fetch attempt:', {
        functionUrl,
        sanitizedUrl,
        platform,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
      });

      const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Create patch with the fetched data
      const patch: EmbeddedAlbum = {
        _type: 'embeddedAlbum',
        embedCode,
        title: data.title || 'Untitled Release',
        artist: data.artist || 'Unknown Artist',
        platform,
        releaseType: data.releaseType || 'album',
        imageUrl: data.imageUrl || '/images/placeholder.png',
        embedUrl: sanitizedUrl,
        isEmbedSupported: supportsEmbedding,
        customImage: value.customImage
      };

      onChange(PatchEvent.from([
        set(patch),
        value.customImage
          ? set(value.customImage, ['customImage'])
          : unset(['customImage'])
      ]));

      isMetadataFetchedRef.current = true;

    } catch (error) {
      console.error('Metadata fetch error:', {
        error,
        functionUrl: getFunctionUrl(),
        sanitizedUrl,
        platform,
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
      });

      // Use fallback values
      const fallbackPatch: EmbeddedAlbum = {
        _type: 'embeddedAlbum',
        embedCode,
        title: 'Error Loading Metadata',
        artist: 'Unknown Artist',
        platform,
        releaseType: 'album',
        imageUrl: '/images/placeholder.png',
        embedUrl: sanitizedUrl,
        isEmbedSupported: supportsEmbedding,
        customImage: value.customImage
      };

      onChange(PatchEvent.from([
        set(fallbackPatch),
        value.customImage
          ? set(value.customImage, ['customImage'])
          : unset(['customImage'])
      ]));

      isMetadataFetchedRef.current = true;
    }
  };

  useEffect(() => {
    if (!embedCode || isMetadataFetchedRef.current) return

    let sanitizedUrl: string = embedCode
    let supportsEmbedding = false

    // Extract URL if iframe is present
    const iframeSrcMatch = embedCode.match(/<iframe.*?src=["'](.*?)["']/i)
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      sanitizedUrl = iframeSrcMatch[1]
      supportsEmbedding = true
    }

    // Further process SoundCloud URLs embedded within SoundCloud's player
    if (sanitizedUrl.includes('w.soundcloud.com/player')) {
      try {
        const urlObj = new URL(sanitizedUrl)
        const resourceUrlEncoded = urlObj.searchParams.get('url')
        if (resourceUrlEncoded) {
          sanitizedUrl = decodeURIComponent(resourceUrlEncoded)
          supportsEmbedding = true
        }
      } catch (error) {
        console.error('Error extracting URL from SoundCloud embed code:', error)
        return
      }
    }

    const detectedPlatform = sanitizedUrl.includes('spotify.com')
      ? 'spotify'
      : sanitizedUrl.includes('soundcloud.com') || sanitizedUrl.includes('api.soundcloud.com')
        ? 'soundcloud'
        : ''

    console.log(`Detected platform: ${detectedPlatform}, Sanitized URL: ${sanitizedUrl}`)

    const functionUrl = getFunctionUrl();
    console.log('Using function URL:', functionUrl);

    async function fetchMetadata() {
      try {
        const functionUrl = await getFunctionUrl();
        console.log('Metadata fetch attempt:', {
          functionUrl,
          sanitizedUrl,
          platform: detectedPlatform,
          hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown'
        });

        let data: Metadata = {
          title: '',
          artist: '',
          imageUrl: '',
          releaseType: '',
          embedUrl: sanitizedUrl,
          isEmbedSupported: supportsEmbedding,
        };

        if (detectedPlatform === 'spotify' || detectedPlatform === 'soundcloud') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(10000)
          });

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          data = await response.json();
          data.isEmbedSupported = supportsEmbedding;
        }

        const patch: EmbeddedAlbum = {
          _type: 'embeddedAlbum',
          embedCode: embedCode || '',
          title: data.title || 'Untitled Release',
          artist: data.artist || 'Unknown Artist',
          platform: detectedPlatform,
          releaseType: data.releaseType || 'album',
          imageUrl: data.imageUrl || '/images/placeholder.png',
          embedUrl: sanitizedUrl,
          isEmbedSupported: data.isEmbedSupported,
        }

        onChange(PatchEvent.from([
          set(patch),
          value.customImage
            ? set(value.customImage, ['customImage'])
            : unset(['customImage'])
        ]))

        isMetadataFetchedRef.current = true

      } catch (error) {
        console.error('Error fetching metadata:', error)
        const fallbackPatch: Omit<EmbeddedAlbum, 'customImage'> = {
          _type: 'embeddedAlbum',
          embedCode: embedCode || '',
          title: 'Error Loading Metadata',
          artist: 'Unknown Artist',
          platform: detectedPlatform,
          releaseType: 'album',
          imageUrl: 'https://example.com/placeholder.png',
          embedUrl: sanitizedUrl,
          isEmbedSupported: supportsEmbedding,
        }

        onChange(PatchEvent.from([
          set(fallbackPatch),
          value.customImage
            ? set(value.customImage, ['customImage'])
            : unset(['customImage'])
        ]))

        isMetadataFetchedRef.current = true
      }
    }

    fetchMetadata()
  }, [embedCode, onChange, value.customImage])

  return (
    <Stack space={4}>
      <Card padding={3}>
        <Stack space={3}>
          <Text>Paste Spotify or SoundCloud embed code:</Text>
          <textarea
            value={value?.embedCode || ''}
            onChange={(e) => handleEmbedCodeChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </Stack>
      </Card>

      <Card padding={3}>
        <Stack space={3}>
          <Text weight="bold">Custom Album Image</Text>
          {renderDefault && renderDefault({
            ...props,
            value: value.customImage,
            path: ['customImage'],
            onChange: (patch: PatchEvent | FormPatch | FormPatch[]) => {
              onChange(patch)
            },
            readOnly: readOnly,
          })}

          {value.customImage && (
            <Stack space={2}>
              <Text size={1}>Custom Album Cover Preview</Text>
              <Card padding={2} radius={2} shadow={1}>
                <img
                  src={urlFor(value.customImage as SanityImage)}
                  alt="Custom album cover"
                  style={{
                    maxWidth: '200px',
                    width: '100%',
                    height: 'auto',
                    borderRadius: '4px'
                  }}
                />
              </Card>
            </Stack>
          )}
        </Stack>
      </Card>

      {value?.embedCode && (
        <Card padding={3}>
          <Stack space={4}>
            {value.customImage && (
              <Stack space={2}>
                <Text size={1}>Custom Album Cover</Text>
                <Card padding={2} radius={2} shadow={1}>
                  <img
                    src={urlFor(value.customImage as SanityImage)}
                    alt="Custom album cover"
                    style={{
                      maxWidth: '200px',
                      width: '100%',
                      height: 'auto',
                      borderRadius: '4px'
                    }}
                  />
                </Card>
              </Stack>
            )}

            {value.isEmbedSupported ? (
              <Box dangerouslySetInnerHTML={{__html: value.embedCode}} />
            ) : (
              <Stack space={3}>
                <Text>Embedding is not supported for this content. You can view it directly:</Text>
                <Button
                  mode="ghost"
                  text={value.embedCode}
                  onClick={() => window.open(value.embedCode, '_blank', 'noopener,noreferrer')}
                />
              </Stack>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  )
}

export default ReleaseInfoInput
