// components/EmbedUrlInput.tsx

import React, {useCallback} from 'react'
import {StringInputProps, PatchEvent, set, unset} from 'sanity'
import {TextInput, Stack} from '@sanity/ui'

const EmbedUrlInput: React.FC<StringInputProps> = (props) => {
  const {value, onChange, readOnly} = props

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.currentTarget.value
      console.log('Input value:', inputValue)

      if (inputValue.trim() === '') {
        onChange(PatchEvent.from(unset()))
      } else {
        onChange(PatchEvent.from(set(inputValue)))
      }
    },
    [onChange],
  )

  return (
    <Stack space={2}>
      <TextInput
        value={value || ''}
        onChange={handleChange}
        placeholder="Enter Spotify or SoundCloud embed iframe code"
        readOnly={readOnly}
      />
    </Stack>
  )
}

export default EmbedUrlInput
