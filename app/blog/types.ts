export interface Post {
  _id: string
  _createdAt: string
  title: string
  slug: {
    current: string
  }
  mainImage: {
    asset: {
      _ref: string
      _type: string
    }
    alt?: string
  }
  excerpt?: string
  body?: any[] // For Portable Text content
  seo?: {
    metaTitle?: string
    metaDescription?: string
    openGraphImage?: {
      asset: {
        url: string
      }
    }
  }
}

export interface BlogPageProps {
  params: {
    slug: string
  }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export interface HomePageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}
