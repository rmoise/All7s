import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import { safeFetch, getClient } from '@lib/client';
import { SanityDocument } from '@sanity/types';
import { PreviewProvider } from '@lib/live';

interface PageProps {
  data: SanityDocument;
  preview: boolean;
}

export default function Page({ data, preview }: PageProps) {
  return (
    <div>
      {preview ? (
        <PreviewProvider preview={preview}>
          <h1>{data.title as string}</h1>
          {/* Other content */}
        </PreviewProvider>
      ) : (
        <>
          <h1>{data.title as string}</h1>
          {/* Other content */}
        </>
      )}
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, preview = false }) => {
  try {
    const slug = params?.slug || '';
    const query = '*[_type == "post" && slug.current == $slug][0]{..., "slug": slug.current}';

    const data = await safeFetch(query, { slug });

    if (!data) {
      console.log('No data found for slug:', slug);
      return { notFound: true };
    }

    return {
      props: {
        data,
        preview,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
};

// Rest of the code remains the same...