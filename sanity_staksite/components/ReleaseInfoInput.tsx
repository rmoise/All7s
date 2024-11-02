import React, {useEffect, useRef} from 'react'
import {Stack, Card, Box, Text, Button} from '@sanity/ui'

// Define types we need
interface SchemaType {
  name: string
  type: string
  fields: Array<Field>
  title?: string
  [key: string]: unknown
}

interface Field {
  name: string
  type: SchemaType
}

interface Patch {
  type: 'set' | 'setIfMissing'
  path: string[]
  value: unknown
}

interface PatchEvent {
  patches: Array<Patch>
  type: 'patch'
  from: Array<string>
}

interface ObjectInputProps {
  type: SchemaType
  value?: Record<string, unknown>
  onChange: (event: PatchEvent) => void
  readOnly?: boolean
  renderDefault?: (props: ObjectInputProps) => React.ReactElement
  schemaType: {
    fields: Array<Field>
  }
  path?: string[]
}

interface ImageValue {
  asset: {
    _ref: string
    _type: string
  }
  [key: string]: unknown
}

interface EmbeddedAlbumValue {
  embedCode?: string
  customImage?: ImageValue
  isEmbedSupported?: boolean
  title?: string
  artist?: string
  platform?: string
  releaseType?: string
  imageUrl?: string
  embedUrl?: string
}

interface Metadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
  embedUrl: string
  isEmbedSupported: boolean
}

interface InputProps extends Omit<ObjectInputProps, 'value' | 'onChange'> {
  value?: EmbeddedAlbumValue
  onChange: (event: PatchEvent) => void
  readOnly?: boolean
}

// Helper functions with proper types
const createPatchEvent = (patches: Patch[]): PatchEvent => ({
  patches,
  type: 'patch',
  from: [],
})

const set = (value: unknown, path: string[] = []): Patch => ({
  type: 'set',
  path,
  value,
})

const setIfMissing = (value: unknown, path: string[] = []): Patch => ({
  type: 'setIfMissing',
  path,
  value,
})

// Rest of your component remains the same
const ReleaseInfoInput = (props: InputProps) => {
  const {value = {}, onChange, readOnly, renderDefault} = props
  const {embedCode, customImage, isEmbedSupported} = value
  const isMetadataFetchedRef = useRef(false)

  useEffect(() => {
    if (!embedCode || isMetadataFetchedRef.current) return

    let sanitizedUrl = embedCode
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
          supportsEmbedding = true
        }
      } catch (error) {
        console.error('Error extracting URL from SoundCloud embed code:', error)
        return
      }
    }

    // Detect platform based on the embed URL
    const detectedPlatform = sanitizedUrl.includes('spotify.com')
      ? 'spotify'
      : sanitizedUrl.includes('soundcloud.com') || sanitizedUrl.includes('api.soundcloud.com')
        ? 'soundcloud'
        : ''

    console.log(`Detected platform: ${detectedPlatform}, Sanitized URL: ${sanitizedUrl}`)

    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const functionUrl =
      hostname === 'localhost'
        ? 'http://localhost:8888/.netlify/functions/music-metadata'
        : hostname.includes('staging')
          ? 'https://staging--all7z.netlify.app/.netlify/functions/music-metadata'
          : 'https://all7z.com/.netlify/functions/music-metadata'

    async function fetchMetadata() {
      try {
        let data: Metadata = {
          title: '',
          artist: '',
          imageUrl: '',
          releaseType: '',
          embedUrl: sanitizedUrl,
          isEmbedSupported: supportsEmbedding,
        }

        if (detectedPlatform === 'spotify' || detectedPlatform === 'soundcloud') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
            method: 'GET',
          })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          data = await response.json()
          data.isEmbedSupported = supportsEmbedding
        } else {
          data = {
            title: 'Unsupported Platform',
            artist: 'Unknown Artist',
            imageUrl: 'https://example.com/placeholder.png',
            releaseType: 'album',
            embedUrl: '',
            isEmbedSupported: false,
          }
        }

        onChange(
          createPatchEvent([
            setIfMissing({}, []),
            set(data.title || 'Untitled Release', ['title']),
            set(data.artist || 'Unknown Artist', ['artist']),
            set(detectedPlatform, ['platform']),
            set(data.releaseType || 'album', ['releaseType']),
            set(data.imageUrl || 'https://example.com/placeholder.png', ['imageUrl']),
            set(data.embedUrl, ['embedUrl']),
            set(embedCode, ['embedCode']),
            set(data.isEmbedSupported, ['isEmbedSupported']),
          ]),
        )

        isMetadataFetchedRef.current = true
        console.log('Metadata fetched and set successfully:', data)
      } catch (err) {
        console.error('Error fetching metadata:', err)
      }
    }

    fetchMetadata()
  }, [embedCode, onChange])

  const imageField = props.schemaType.fields.find(
    (field: Field) => field.name === 'customImage' && field.type.name === 'image'
  )

  return (
    <Stack space={4}>
      {imageField && renderDefault && (
        renderDefault({
          ...props,
          value: customImage as Record<string, unknown>,
          path: ['customImage'],
          schemaType: imageField.type,
          onChange: (patchEvent: PatchEvent) => {
            onChange(patchEvent)
          },
          readOnly: readOnly,
        })
      )}

      {embedCode && (
        isEmbedSupported ? (
          <Card padding={3}>
            <Box dangerouslySetInnerHTML={{__html: embedCode}} />
          </Card>
        ) : (
          <Card padding={3}>
            <Stack space={3}>
              <Text>Embedding is not supported for this content. You can view it directly:</Text>
              <Button
                mode="ghost"
                text={embedCode}
                onClick={() => window.open(embedCode, '_blank', 'noopener,noreferrer')}
              />
            </Stack>
          </Card>
        )
      )}
    </Stack>
  )
}

export default ReleaseInfoInput
