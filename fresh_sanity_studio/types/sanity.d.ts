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

// Add new declarations for schema definitions
declare module 'sanity' {
  import type { ComponentType, ReactElement } from 'react'
  import type { Config } from 'sanity'

  // Update the plugin types
  export interface PluginOptions {
    name: string
    [key: string]: any
  }

  // Update the config interface
  export interface SanityConfig extends Config {
    name: string
    title: string
    basePath?: string
    projectId: string
    dataset: string
    plugins: PluginOptions[]
    icon?: ComponentType<any>
    schema: {
      types: SchemaTypeDefinition[];
    };
    document?: {
      actions?: (input: any[], context: { schemaType: string }) => any[]
    }
    form?: {
      file?: {
        assetSources?: (prev: any[]) => any[]
      }
      image?: {
        assetSources?: (prev: any[]) => any[]
      }
    }
    studio?: {
      components?: {
        layout?: ComponentType<any>
      }
    }
    env?: Record<string, string | undefined>
  }

  export interface SchemaPluginOptions {
    types: SchemaTypeDefinition[]
    templates?: (prev: any[]) => any[]
  }

  export interface SchemaTypeDefinition extends BaseSchemaDefinition {
    type: string
    validation?: (rule: ValidationRule) => ValidationRule
  }

  // Add module augmentation for .js extensions
  export interface ImportMetaEnv {
    readonly [key: string]: string | undefined
  }

  export interface ValidationRule {
    required: () => ValidationRule
    custom: (fn: (value: any, context: ValidationContext) => true | string) => ValidationRule
    uri: (options: {scheme: string[]}) => ValidationRule
    warning: (message: string) => ValidationRule
  }

  export interface ValidationContext {
    document?: {
      albumSource?: string
      [key: string]: any
    }
    parent?: any
    path?: string[]
  }

  export function defineType(schema: {
    name: string
    title: string
    type: string
    fields?: any[]
    preview?: {
      select: Record<string, string>
      prepare: (selection: any) => {
        title: string
        subtitle?: string
        media?: React.ReactElement
      }
    }
    [key: string]: any
  }): any

  export function defineField(field: {
    name: string
    title: string
    type: string
    validation?: (rule: ValidationRule) => ValidationRule
    [key: string]: any
  }): any

  export function defineArrayMember(member: {
    type: string
    [key: string]: any
  }): any

  // Add the defineConfig type
  export function defineConfig(config: SanityConfig | SanityConfig[]): any

  export type ExperimentalAction = 'create' | 'update' | 'delete' | 'publish'

  export interface BaseSchemaDefinition {
    name: string
    title?: string
    type: string
    __experimental_actions?: ExperimentalAction[]
    [key: string]: any
  }

  export interface PrepareViewOptions {
    [key: string]: any
  }

  export interface PreviewValue {
    title?: string
    subtitle?: string
    media?: any
  }

  export interface PreviewConfig<TSelect extends Record<string, string>> {
    select: TSelect
    prepare: (
      value: { [K in keyof TSelect]: any },
      viewOptions?: PrepareViewOptions
    ) => PreviewValue
  }

  export interface DocumentDefinition extends BaseSchemaDefinition {
    name: string
    title?: string
    type: 'document'
    __experimental_actions?: ExperimentalAction[]
    fields?: any[]
    preview?: PreviewConfig<Record<string, string>>
  }

  export function defineType<T extends DocumentDefinition>(schema: T): T
  export function defineField<T extends BaseSchemaDefinition>(field: T): T
  export function defineArrayMember<T extends BaseSchemaDefinition>(member: T): T
}

declare module 'sanity/desk' {
  import type { PluginOptions } from 'sanity'

  export interface StructureBuilder {
    list: () => ListBuilder
    listItem: () => ListItemBuilder
    documentTypeList: (type: string) => ListBuilder
    documentTypeListItems: () => ListItemBuilder[]
    document: () => DocumentBuilder & {
      views: (views: any[]) => DocumentBuilder
    }
    editor: () => EditorBuilder
    view: {
      form: () => any
      component: (component: any) => any
    }
    divider: () => any
  }

  interface ListBuilder {
    id?: string
    title: (title: string) => ListBuilder
    items: (items: any[]) => ListBuilder
  }

  interface ListItemBuilder {
    id: (id: string) => ListItemBuilder
    title: (title: string) => ListItemBuilder
    icon: (icon: React.ComponentType) => ListItemBuilder
    child: (child: any) => ListItemBuilder
    getId: () => string
  }

  interface DocumentBuilder {
    id?: string
    schemaType: (type: string) => DocumentBuilder
    documentId: (id: string) => DocumentBuilder
    title: (title: string) => DocumentBuilder
    views: (views: any[]) => DocumentBuilder
    child?: (child: any) => DocumentBuilder
  }

  interface EditorBuilder {
    id?: string
    schemaType: (type: string) => EditorBuilder
    documentId: (id: string) => EditorBuilder
    title: (title: string) => EditorBuilder
  }

  export interface DeskToolOptions {
    structure?: (builder: StructureBuilder) => ListBuilder
    defaultDocumentNode?: (S: StructureBuilder, ctx: any) => DocumentBuilder | EditorBuilder
  }

  export const deskTool: (options?: DeskToolOptions) => PluginOptions

  export type DefaultDocumentNodeResolver = (
    S: StructureBuilder,
    context: { schemaType: string }
  ) => DocumentBuilder;

  export const defaultDocumentNode: DefaultDocumentNodeResolver;
}

declare module 'sanity-plugin-media' {
  import type { PluginOptions } from 'sanity'
  export const media: () => PluginOptions
}

declare module '@sanity/color-input' {
  import type { PluginOptions } from 'sanity'
  export const colorInput: () => PluginOptions
}

declare module '@sanity/vision' {
  import type { PluginOptions } from 'sanity'
  export const visionTool: () => PluginOptions
}

declare module 'sanity-plugin-hotspot-array' {
  import type { PluginOptions } from 'sanity'
  export const imageHotspotArrayPlugin: () => PluginOptions
}

// Update module declarations for local files to use string literals
declare module '*.js' {
  const content: any
  export default content
}

declare module '*.jsx' {
  const content: any
  export default content
}

declare module '*.ts' {
  const content: any
  export default content
}

declare module '*.tsx' {
  const content: any
  export default content
}

// Add or update these interfaces
export interface SanityImageHotspot {
  _type: 'sanity.imageHotspot';
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface SanityImageType {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  hotspot?: SanityImageHotspot;
  crop?: {
    _type: 'sanity.imageCrop';
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export interface EmbeddedAlbumValue {
  customImage?: SanityImageType;
  // ... other properties
}

// Update the Props interface
interface Props {
  value?: EmbeddedAlbumValue;
  onChange: (patch: any) => void;
  readOnly?: boolean;
  schemaType: SchemaType;
  renderDefault: (props: any) => ReactElement;
}

export interface SchemaValidationValue {
  (rule: ValidationRule): ValidationRule | ValidationRule[];
}

// Update the TypeAliasDefinition interface to include all possible schema types
export interface TypeAliasDefinition<Name extends string, Type extends SchemaType> {
  name: Name;
  type: Type;
  title?: string;
  validation?: SchemaValidationValue;
  [key: string]: any;
}

// Add a type for all possible Sanity schema types
type SchemaType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'text'
  | 'color'
  | 'image'
  | 'date'
  | 'email'
  | 'file'
  | 'url'
  | 'geopoint'
  | 'reference'
  | 'block'
  | 'slug'
  | 'document'
  | 'array'
  | 'crossDatasetReference'
  | 'datetime';

export interface SchemaTypeDefinition extends TypeAliasDefinition<string, SchemaType> {
  validation?: (rule: ValidationRule) => ValidationRule | ValidationRule[];
  fields?: Array<{
    name: string;
    type: SchemaType;
    [key: string]: any;
  }>;
  preview?: {
    select: Record<string, string>;
    prepare: (selection: any) => {
      title: string;
      subtitle?: string;
      media?: React.ReactElement;
    };
  };
}
