// ReleaseInfoInput.tsx

import React, {useEffect, useRef} from 'react'
import {
  defineField,
  defineType,
  type Path,
  type FormPatch,
  type ObjectField,
  type SchemaType,
  PatchEvent,
  set,
  setIfMissing,
} from 'sanity'
import {Stack} from '@sanity/ui'

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

interface Metadata {
  title: string
  artist: string
  imageUrl: string
  releaseType: string
  embedUrl: string
  isEmbedSupported: boolean
}

type Props = {
  value?: EmbeddedAlbumValue
  onChange: (patch: FormPatch | PatchEvent | FormPatch[]) => void
  readOnly?: boolean
  schemaType: SchemaType
  renderDefault: (props: any) => React.ReactElement
}

const ReleaseInfoInput = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
  const {value = {}, onChange, readOnly, schemaType} = props
  const {embedCode, customImage, isEmbedSupported} = value
  const isMetadataFetchedRef = useRef(false)

  return (
    <Stack ref={ref} space={4}>
      {(schemaType as any).fields?.find(
        (field: ObjectField<SchemaType>): field is ObjectField<SchemaType> =>
          field.name === 'customImage' && field.type.name === 'image'
      ) &&
        props.renderDefault({
          ...props,
          value: customImage,
          path: ['customImage'] as Path,
          schemaType: ((schemaType as any).fields?.find(
            (field: ObjectField<SchemaType>) =>
              field.name === 'customImage' && field.type.name === 'image'
          )?.type),
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
