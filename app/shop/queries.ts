export const productsQuery = `*[_type == "product"] | order(_createdAt desc) {
  _id,
  name,
  price,
  "slug": slug.current,
  "mainImage": image[0] {
    asset-> {
      _id,
      url,
      metadata { dimensions }
    },
    alt
  },
  "category": category->title
}`;

export const productDetailQuery = `*[_type == "product" && slug.current == $slug][0] {
  _id,
  name,
  price,
  description[] {
    ...,
    _type,
    style,
    children[] {
      ...,
      _type,
      marks,
      text
    }
  },
  slug,
  image[] {
    asset-> {
      _id,
      url,
      metadata {
        dimensions
      }
    },
    alt
  },
  category->{
    title,
    description
  },
  seo
}`;

export const postsQuery = `*[_type == "post"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  mainImage,
  excerpt,
  _createdAt,
  author->{
    name
  }
}`;