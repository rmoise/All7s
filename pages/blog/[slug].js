import { client, urlFor } from '../../lib/client';
import { PortableText } from '@portabletext/react';
import { useState, useEffect } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import SEO from '../../components/common/SEO'; // Import reusable SEO component

const components = {
  types: {
    image: ({ value }) => <img className="mt-8" src={urlFor(value.asset)} />,
  },
  block: {
    h1: ({ children }) => <h1 className="text-7xl">{children}</h1>,
    normal: ({ children }) => <p className="text-xl mt-12">{children}</p>,
  },
};

const Details = ({ title, body, mainImage, seo }) => {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const imgBuilder = imageUrlBuilder({
      projectId: '1gxdk71x',
      dataset: 'production',
    });
    setImageUrl(imgBuilder.image(mainImage).url());
  }, [mainImage]);

  // Combined title for SEO and brand consistency
  const pageTitle = seo?.metaTitle ? `${seo.metaTitle} - ${title}` : title || 'Blog Post';

  return (
    <div className="flex flex-col items-center mt-28">
      {/* SEO Component */}
      <SEO
        title={pageTitle}
        description={seo?.metaDescription || "Read our latest blog post."}
        openGraphImage={seo?.openGraphImage?.asset?.url}
      />

      <h1 className="text-9xl font-Headline">{title}</h1>
      {imageUrl && <img className="mt-8 w-3/4" src={imageUrl} alt={title} />}
      <div className="mt-20 portable-text flex flex-col gap-y-30">
        <PortableText value={body} components={components} />
      </div>
    </div>
  );
};

export const getServerSideProps = async (pageContext) => {
  const pageSlug = pageContext.query.id;

  if (!pageSlug) {
    return {
      notFound: true,
    };
  }

  const query = `*[ _type == "post" && slug.current == "${pageSlug}" ][0]{
    title,
    body,
    mainImage,
    "seo": seo{
      metaTitle,
      metaDescription,
      openGraphImage{
        asset->{
          url
        }
      }
    }
  }`;

  const post = await client.fetch(query);

  if (!post) {
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        title: post.title,
        body: post.body,
        mainImage: post.mainImage,
        seo: post.seo || {},
      },
    };
  }
};

export default Details;
