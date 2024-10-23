import React, {useEffect, useRef} from 'react'
import {ObjectInputProps, PatchEvent, set} from 'sanity'
import {Stack} from '@sanity/ui'
import {useClient, ImageValue, ImageSchemaType} from 'sanity'

interface EmbeddedAlbumValue {
  embedUrl?: string
  customImage?: ImageValue
}

interface SpotifyMetadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
}

const ReleaseInfoInput = (props: ObjectInputProps<EmbeddedAlbumValue>) => {
  const {value = {}, onChange, readOnly} = props
  const {embedUrl, customImage} = value
  const client = useClient({apiVersion: '2023-10-21'})

  const isMetadataFetchedRef = useRef(false)

  useEffect(() => {
    console.log('ReleaseInfoInput value:', value)
    if (!embedUrl || isMetadataFetchedRef.current) return

    let sanitizedUrl = embedUrl
    const iframeMatch = embedUrl.match(/src="([^"]+)"/)
    if (iframeMatch) {
      sanitizedUrl = iframeMatch[1]
    }

    console.log('Starting metadata fetch for embedUrl:', sanitizedUrl)

    let detectedPlatform = ''
    if (sanitizedUrl.includes('spotify.com')) {
      detectedPlatform = 'spotify'
    } else if (sanitizedUrl.includes('soundcloud.com')) {
      detectedPlatform = 'soundcloud'
    }

    const hostname = window.location.hostname
    const functionUrl =
      hostname === 'localhost'
        ? 'http://localhost:8888/api/spotify-metadata'
        : hostname === 'staging--all7z.netlify.app'
          ? 'https://staging--all7z.netlify.app/.netlify/functions/spotify-metadata'
          : 'https://all7z.com/.netlify/functions/spotify-metadata' // Production URL

    async function fetchMetadata() {
      try {
        let data: SpotifyMetadata = {title: '', artist: '', imageUrl: '', releaseType: ''}

        if (detectedPlatform === 'spotify') {
          const response = await fetch(`${functionUrl}?url=${encodeURIComponent(sanitizedUrl)}`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          data = await response.json()

          console.log('Metadata fetched:', data)

          // Patch the fetched data into Sanity fields
          onChange(
            PatchEvent.from([
              set(data.title || 'Untitled Release', ['title']),
              set(data.artist || 'Unknown Artist', ['artist']),
              set(detectedPlatform, ['platform']),
              set(data.releaseType || '', ['releaseType']),
            ]),
          )

          // Upload image to Sanity if customImage is empty
          if (data.imageUrl && !customImage) {
            const imageResponse = await fetch(data.imageUrl)
            const imageBlob = await imageResponse.blob()
            const file = new File([imageBlob], 'spotify-image.jpg', {type: imageBlob.type})
            const asset = await client.assets.upload('image', file, {
              filename: 'spotify-image.jpg',
            })

            // Patch customImage into Sanity
            onChange(
              PatchEvent.from([
                set(
                  {
                    _type: 'image',
                    asset: {
                      _type: 'reference',
                      _ref: asset._id,
                    },
                  },
                  ['customImage'],
                ),
              ]),
            )
          }

          isMetadataFetchedRef.current = true
        }
      } catch (err) {
        console.error('Error fetching metadata:', err)
      }
    }

    fetchMetadata()
  }, [embedUrl, onChange, client, customImage, value])

  return (
    <Stack space={4}>
      {/* Only show the fields from the schema */}
      <div>
        {/* Custom Image Field */}
        {props.schemaType.fields.find(
          (field): field is {name: string; type: ImageSchemaType} => field.name === 'customImage',
        ) &&
          props.renderDefault({
            ...props,
            value: customImage,
            path: [...props.path, 'customImage'],
            schemaType: props.schemaType.fields.find(
              (field): field is {name: string; type: ImageSchemaType} =>
                field.name === 'customImage',
            )!.type,
            onChange: (patchEvent) => {
              onChange(patchEvent)
            },
            readOnly: readOnly,
          })}
      </div>
    </Stack>
  )
}

export default ReleaseInfoInput
