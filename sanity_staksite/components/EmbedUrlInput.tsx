// components/EmbedUrlInput.tsx

import React, {useCallback} from 'react'
import {StringInputProps, PatchEvent, set, unset} from 'sanity'
import {TextInput, Stack} from '@sanity/ui'

const extractSpotifyUrl = (input: string): string => {
  if (!input) return ''

  // Remove any HTML entities and decode
  const decodedInput = input.replace(/&quot;/g, '"').replace(/&amp;/g, '&')

  // Check if input is an iframe HTML string
  const iframeMatch = decodedInput.match(/src=["']([^"']+)["']/)
  if (iframeMatch) {
    const url = new URL(iframeMatch[1])
    return url.toString()
  }

  // If it's already a URL, clean and return it
  if (decodedInput.includes('spotify.com')) {
    try {
      const url = new URL(decodedInput.trim())
      return url.toString()
    } catch (e) {
      return ''
    }
  }

  return ''
}

const EmbedUrlInput: React.FC<StringInputProps> = (props) => {
  const {value, onChange, readOnly} = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value

      if (!inputValue) {
        onChange(PatchEvent.from(unset()))
        return
      }

      const cleanUrl = extractSpotifyUrl(inputValue)
      onChange(PatchEvent.from(set(cleanUrl)))
    },
    [onChange],
  )

  return (
    <Stack space={2}>
      <TextInput
        value={value || ''}
        onChange={handleChange}
        placeholder="Enter Spotify URL or embed code"
        readOnly={readOnly}
      />
    </Stack>
  )
}

export default EmbedUrlInput
