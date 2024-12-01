export const blogPageQuery = `*[_type == "blogPage"][0] {
  heroTitle,
  heroImage{
    asset->{
      url
    },
    alt
  },
  featuredPosts[]->{
    _id,
    title,
    slug,
    mainImage,
    excerpt
  },
  seo
}`

export const postsQuery = `*[_type == "post"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  mainImage {
    _type,
    asset-> {
      _ref,
      _type,
      url
    }
  },
  excerpt,
  _createdAt,
  author->{
    name,
    picture {
      asset-> {
        _ref,
        _type,
        url
      }
    }
  },
  categories[]-> {
    title,
    slug,
    color
  }
}`

export const postDetailQuery = `*[_type == "post" && slug.current == $slug][0]{
  title,
  body,
  mainImage {
    _type,
    asset-> {
      _ref,
      _type,
      url
    }
  },
  slug,
  _createdAt,
  author->{
    name,
    picture {
      asset-> {
        _ref,
        _type,
        url
      }
    },
    bio
  },
  categories[]-> {
    title,
    slug,
    color
  },
  "relatedPosts": *[_type == "post" && slug.current != $slug && _id != ^._id] | order(_createdAt desc) [0...3] {
    _id,
    title,
    slug,
    mainImage {
      _type,
      asset-> {
        _ref,
        _type,
        url
      }
    },
    excerpt,
    author->{
      name,
      picture {
        asset-> {
          _ref,
          _type,
          url
        }
      }
    },
    _createdAt,
    categories[]->
  }
}`