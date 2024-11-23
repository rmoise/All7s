import type { SiteSettings, ContentBlock } from './index'

// Base types
type SearchParamsType = { [key: string]: string | string[] | undefined };

// Next.js specific types that match internal expectations
export type PageProps<P = any> = {
  params: Promise<P>;
  searchParams: Promise<SearchParamsType>;
}

// Specific page param types
export type BlogParams = {
  slug: string;
}

export type ShopParams = {
  slug: string;
}

// Page-specific props
export type BlogPageProps = PageProps<BlogParams>
export type ShopPageProps = PageProps<ShopParams>

// Home page specific props
export type HomePageProps = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<SearchParamsType>;
}

// Separate type for the home page data
export type HomePageData = {
  title?: string;
  metaTitle?: string;
  metaDescription?: string;
  contentBlocks?: ContentBlock[];
  siteSettings?: SiteSettings;
}