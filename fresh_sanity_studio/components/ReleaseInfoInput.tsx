// ReleaseInfoInput.tsx

import React, { useRef } from 'react'
import type { Path } from '@sanity/types'
import { Stack } from '@sanity/ui'

// Type definitions
interface SanityAssetReference {
  _ref: string
  _type: 'reference'
}

interface SanityImageType {
  _type: 'image'
  asset: SanityAssetReference
  hotspot?: { x: number; y: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

interface EmbeddedAlbumValue {
  embedCode?: string
  customImage?: SanityImageType
  isEmbedSupported?: boolean
}

interface ObjectField {
  name: string
  type: { name: string }
}

interface SchemaType {
  fields?: ObjectField[]
}

// Define PatchEvent type since it's not available in @sanity/types
type PatchEvent = any // TODO: Replace with proper type if needed

type Props = {
  value?: EmbeddedAlbumValue
  onChange: (patch: PatchEvent) => void
  readOnly?: boolean
  schemaType: SchemaType
  renderDefault: (props: any) => React.ReactElement
}

const ReleaseInfoInput = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { value = {}, onChange, readOnly, schemaType } = props
  const { embedCode, customImage, isEmbedSupported } = value

  return (
    <Stack ref={ref} space={4}>
      {(schemaType as any).fields?.find(
        (field: ObjectField): field is ObjectField =>
          field.name === 'customImage' && field.type.name === 'image'
      ) &&
        props.renderDefault({
          ...props,
          value: customImage,
          path: ['customImage'] as Path,
          schemaType: ((schemaType as any).fields?.find(
            (field: ObjectField) =>
              field.name === 'customImage' && field.type.name === 'image'
          )?.type),
          onChange: (patch: PatchEvent) => {
            onChange(patch)
          },
          readOnly,
        })}

      {embedCode &&
        (isEmbedSupported ? (
          <div dangerouslySetInnerHTML={{ __html: embedCode }} />
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
