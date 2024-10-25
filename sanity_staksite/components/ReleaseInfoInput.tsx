// components/Music/ReleaseInfoInput.tsx

import React, {useEffect, useRef} from 'react'
import {ObjectInputProps, PatchEvent, set, setIfMissing} from 'sanity'
import {Stack} from '@sanity/ui'
import {useClient, ImageValue, ImageSchemaType} from 'sanity'

interface EmbeddedAlbumValue {
  embedUrl?: string
  customImage?: ImageValue
  imageUrl?: string // Ensure imageUrl is included
}

interface SpotifyMetadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
}

const ReleaseInfoInput = (props: ObjectInputProps<EmbeddedAlbumValue>) => {
  const {value = {}, onChange, readOnly, path} = props
  const {embedUrl, customImage, imageUrl} = value // Ensure value corresponds to embeddedAlbum
  const client = useClient({apiVersion: '2023-10-21'})

  const isMetadataFetchedRef = useRef(false)

  useEffect(() => {
    console.log('ReleaseInfoInput path:', path)
    console.log('ReleaseInfoInput value:', value)
    console.log('Current imageUrl:', imageUrl)

    if (!embedUrl || isMetadataFetchedRef.current) return

    // Extract only the src URL from the iframe tag
    const sanitizedUrl = embedUrl.includes('iframe')
      ? embedUrl.match(/src="([^"]+)"/)?.[1] || embedUrl
      : embedUrl

    // Ensure the sanitized URL does not point to your Sanity Studio
    const isExternalUrl =
      typeof window !== 'undefined' ? !sanitizedUrl.includes(window.location.origin) : true

    if (!isExternalUrl) {
      console.error('Sanity Studio URL detected. Please provide an external embed URL.')
      return
    }

    const detectedPlatform = sanitizedUrl.includes('spotify.com') ? 'spotify' : ''

    const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
    const functionUrl =
      hostname === 'localhost'
        ? 'http://localhost:8888/.netlify/functions/spotify-metadata'
        : hostname.includes('staging')
          ? 'https://staging--all7z.netlify.app/.netlify/functions/spotify-metadata'
          : 'https://all7z.com/.netlify/functions/spotify-metadata' // Production URL

    async function fetchMetadata() {
      try {
        let data: SpotifyMetadata = {title: '', artist: '', imageUrl: '', releaseType: ''}

        if (detectedPlatform === 'spotify') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
            method: 'GET',
          })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          data = await response.json()

          console.log('Metadata fetched:', data)

          // Initialize 'embeddedAlbum' if missing and set nested fields
          onChange(
            PatchEvent.from([
              setIfMissing({}, []), // Initialize 'embeddedAlbum' as an empty object if missing
              set(data.title || 'Untitled Release', ['title']),
              set(data.artist || 'Unknown Artist', ['artist']),
              set(detectedPlatform, ['platform']),
              set(data.releaseType || 'album', ['releaseType']),
              set(
                data.imageUrl || 'https://i.scdn.co/image/ab67616d0000b27302d5ec278fcb99f5608dd107',
                ['imageUrl'],
              ),
              set(sanitizedUrl || embedUrl, ['embedUrl']), // Set embedUrl to sanitizedUrl
            ]),
          )

          console.log('Metadata patched into Sanity fields')
        }
        isMetadataFetchedRef.current = true
      } catch (err) {
        console.error('Error fetching metadata:', err)
      }
    }

    fetchMetadata()
  }, [embedUrl, onChange, client, customImage, value, path])

  return (
    <Stack space={4}>
      {/* Custom Image Field */}
      {props.schemaType.fields.find(
        (field): field is {name: string; type: ImageSchemaType} => field.name === 'customImage',
      ) &&
        props.renderDefault({
          ...props,
          value: customImage,
          path: ['customImage'], // Use relative path
          schemaType: props.schemaType.fields.find(
            (field): field is {name: string; type: ImageSchemaType} => field.name === 'customImage',
          )!.type,
          onChange: (patchEvent) => {
            onChange(patchEvent)
          },
          readOnly: readOnly,
        })}

      {/* Render the Spotify Embed using the sanitized URL */}
      {embedUrl && (
        <iframe
          style={{borderRadius: '12px'}}
          src={
            embedUrl.includes('iframe')
              ? embedUrl.match(/src="([^"]+)"/)?.[1] || embedUrl
              : embedUrl
          }
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>
      )}
    </Stack>
  )
}

export default ReleaseInfoInput
