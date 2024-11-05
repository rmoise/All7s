import { SiteSettings } from './sanity';

export interface PageProps {
  siteSettings?: SiteSettings;
  metaTitle?: string;
  metaDescription?: string;
  preview?: boolean;
  canonicalUrl?: string;
  contentBlocks?: any[]; // Add other specific block types as needed
} 