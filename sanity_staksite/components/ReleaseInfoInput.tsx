import React, {useEffect, useRef, useState} from 'react'
import {ObjectInputProps, PatchEvent, set, setIfMissing} from 'sanity'
import {Stack} from '@sanity/ui'
import {useClient, ImageValue, ImageSchemaType} from 'sanity'

interface EmbeddedAlbumValue {
  embedUrl?: string
  customImage?: ImageValue
}

interface Metadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
}

const ReleaseInfoInput = (props: ObjectInputProps<EmbeddedAlbumValue>) => {
  const {value = {}, onChange, readOnly} = props
  const {embedUrl, customImage} = value
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState(embedUrl || '') // Ensure defined with default
  const client = useClient({apiVersion: '2023-10-21'})
  const isMetadataFetchedRef = useRef(false)

  useEffect(() => {
    // Reset the embed URL state when URL changes
    if (embedUrl !== currentEmbedUrl) {
      setCurrentEmbedUrl(embedUrl || '') // Provide a fallback to prevent undefined
      isMetadataFetchedRef.current = false // Reset to allow metadata fetch
    }

    if (!embedUrl || isMetadataFetchedRef.current) return

    const sanitizedUrl = embedUrl.includes('iframe')
      ? embedUrl.match(/src="([^"]+)"/)?.[1] || embedUrl
      : embedUrl

    const isExternalUrl =
      typeof window !== 'undefined' ? !sanitizedUrl.includes(window.location.origin) : true

    if (!isExternalUrl) {
      console.error('Sanity Studio URL detected. Please provide an external embed URL.')
      return
    }

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
        let data: Metadata = {title: '', artist: '', imageUrl: '', releaseType: ''}

        if (detectedPlatform === 'spotify') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`, {
            method: 'GET',
          })
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          data = await response.json()
        } else if (detectedPlatform === 'soundcloud') {
          data = {
            title: 'SoundCloud Playlist',
            artist: 'Various Artists',
            imageUrl: 'https://example.com/soundcloud-placeholder.png',
            releaseType: 'playlist',
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
            set(sanitizedUrl || embedUrl, ['embedUrl']),
          ]),
        )

        isMetadataFetchedRef.current = true
      } catch (err) {
        console.error('Error fetching metadata:', err)
      }
    }

    fetchMetadata()
  }, [embedUrl, onChange, client, customImage, value, currentEmbedUrl])

  return (
    <Stack space={4}>
      {props.schemaType.fields.find(
        (field): field is {name: string; type: ImageSchemaType} => field.name === 'customImage',
      ) &&
        props.renderDefault({
          ...props,
          value: customImage,
          path: ['customImage'],
          schemaType: props.schemaType.fields.find(
            (field): field is {name: string; type: ImageSchemaType} => field.name === 'customImage',
          )!.type,
          onChange: (patchEvent) => {
            onChange(patchEvent)
          },
          readOnly: readOnly,
        })}

      {embedUrl && (
        <iframe
          style={{borderRadius: '12px'}}
          src={
            currentEmbedUrl.includes('iframe')
              ? currentEmbedUrl.match(/src="([^"]+)"/)?.[1] || currentEmbedUrl
              : currentEmbedUrl
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
