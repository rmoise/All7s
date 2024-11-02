// ReleaseInfoInput.tsx

import React, {useEffect, useRef} from 'react'
import {
  defineField,
  defineType,
  type ObjectInputProps,
  type ImageValue,
  type ObjectSchemaType,
  type Path,
  type FormPatch,
  type InputProps,
  type ObjectField,
  type SchemaType,
  PatchEvent,
  set,
  setIfMissing,
} from 'sanity'
import {Stack} from '@sanity/ui'

interface EmbeddedAlbumValue {
  embedCode?: string
  customImage?: ImageValue
  isEmbedSupported?: boolean
}

interface Metadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
  embedUrl: string
  isEmbedSupported: boolean
}

type Props = InputProps & ObjectInputProps<EmbeddedAlbumValue, ObjectSchemaType>

const ReleaseInfoInput = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {value = {}, onChange, readOnly, schemaType} = props
  const {embedCode, customImage, isEmbedSupported} = value
  const isMetadataFetchedRef = useRef(false)

  useEffect(() => {
    if (!embedCode || isMetadataFetchedRef.current) return

    let sanitizedUrl = embedCode
    let supportsEmbedding = false // Flag for iframe detection

    // Extract URL if iframe is present
    const iframeSrcMatch = embedCode.match(/<iframe.*?src=["'](.*?)["']/i)
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      sanitizedUrl = iframeSrcMatch[1]
      supportsEmbedding = true // Set flag if iframe is detected
    }

    // Further process SoundCloud URLs embedded within SoundCloud's player
    if (sanitizedUrl.includes('w.soundcloud.com/player')) {
      try {
        const urlObj = new URL(sanitizedUrl)
        const resourceUrlEncoded = urlObj.searchParams.get('url')
        if (resourceUrlEncoded) {
          sanitizedUrl = decodeURIComponent(resourceUrlEncoded)
          supportsEmbedding = true // Confirm embedding is supported
        }
      } catch (error) {
        console.error('Error extracting URL from SoundCloud embed code:', error)
        return
      }
    }

    sanitizedUrl = sanitizedUrl.split('?')[0]

    const detectedPlatform = sanitizedUrl.includes('spotify.com')
      ? 'spotify'
      : sanitizedUrl.includes('soundcloud.com')
        ? 'soundcloud'
        : ''

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
          isEmbedSupported: supportsEmbedding, // Set based on iframe detection
        }

        if (detectedPlatform === 'spotify' || detectedPlatform === 'soundcloud') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
            method: 'GET',
          })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          data = await response.json()
          data.isEmbedSupported = supportsEmbedding // Ensure the embed support flag is set
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
          PatchEvent.from([
            setIfMissing({}, []),
            set(data.title || 'Untitled Release', ['title']),
            set(data.artist || 'Unknown Artist', ['artist']),
            set(detectedPlatform, ['platform']),
            set(data.releaseType || 'album', ['releaseType']),
            set(data.imageUrl || 'https://example.com/placeholder.png', ['imageUrl']),
            set(embedCode, ['embedCode']),
            set(data.isEmbedSupported, ['isEmbedSupported']),
          ]),
        )

        isMetadataFetchedRef.current = true
      } catch (err) {
        console.error('Error fetching metadata:', err)
      }
    }

    fetchMetadata()
  }, [embedCode, onChange])

  return (
    <Stack ref={ref} space={4}>
      {(schemaType as ObjectSchemaType).fields?.find(
        (field: ObjectField<SchemaType>): field is ObjectField<SchemaType> =>
          field.name === 'customImage' && field.type.name === 'image'
      ) &&
        props.renderDefault({
          ...props,
          value: customImage,
          path: ['customImage'] as Path,
          schemaType: ((schemaType as ObjectSchemaType).fields?.find(
            (field: ObjectField<SchemaType>) =>
              field.name === 'customImage' && field.type.name === 'image'
          )?.type as ObjectSchemaType),
          onChange: (patch: FormPatch | PatchEvent | FormPatch[]) => {
            onChange(patch)
          },
          readOnly,
        })}

      {embedCode &&
        (isEmbedSupported ? (
          <div dangerouslySetInnerHTML={{__html: embedCode}} />
        ) : (
          <div>
            <p>Embedding is not supported for this content. You can view it directly:</p>
            <a href={embedCode} target="_blank" rel="noopener noreferrer">
              {embedCode}
            </a>
          </div>
        ))}
    </Stack>
  )
})

ReleaseInfoInput.displayName = 'ReleaseInfoInput'

export default ReleaseInfoInput
