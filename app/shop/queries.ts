export const productsQuery = `*[_type == "product"] {
  _id,
  name,
  price,
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
  }
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