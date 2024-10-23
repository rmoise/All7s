/* eslint-disable @typescript-eslint/no-explicit-any */

// Declare module 'part:@sanity/form-builder/patch-event'
declare module 'part:@sanity/form-builder/patch-event' {
  import {Patch} from '@sanity/types'

  export class PatchEvent {
    static from(...patches: Patch[]): PatchEvent
    constructor(patches?: Patch[], markDefinitions?: unknown[])
    // Add other methods or properties if needed
  }

  export function set<T>(value: T): PatchEvent
  export function unset(): PatchEvent
  export function insert<T>(
    type: 'before' | 'after' | 'replace',
    path: string,
    value: T,
  ): PatchEvent
  export function splice<T>(path: string, index: number, howMany: number, ...items: T[]): PatchEvent
}

// Declare module '@sanity/form-builder' for other exports if necessary
declare module '@sanity/form-builder' {
  import {PatchEvent} from 'part:@sanity/form-builder/patch-event'
  import {StringSchemaType} from '@sanity/types'

  export interface ExtendedStringSchemaType extends StringSchemaType {
    name: string
    title: string
    // Add other necessary properties if needed
  }

  export interface StringInputProps {
    type: ExtendedStringSchemaType
    value: string
    readOnly?: boolean
    placeholder?: string
    onChange: (event: PatchEvent) => void
    onFocus?: () => void
    onBlur?: () => void
    // Add other props as needed
  }

  // Declare other interfaces or types if needed
}

// Declare module 'part:@sanity/base/portable-text-editor' if needed
declare module 'part:@sanity/base/portable-text-editor' {
  import {PortableTextEditor as BasePortableTextEditor} from '@sanity/portable-text-editor'
  export default BasePortableTextEditor
}
