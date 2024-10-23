declare module '@sanity/vision' {
  import {PluginOptions} from 'sanity';

  export interface VisionToolOptions {
    defaultApiVersion?: string;
  }

  export function visionTool(options?: VisionToolOptions): PluginOptions;
}

