import { client, urlFor } from '../../lib/client'
import { PortableText } from '@portabletext/react'
import { useState, useEffect } from 'react'
import imageUrlBuilder from '@sanity/image-url'

const components = {
    types: {
        image: ({ value }) => {
            if (!value?.asset) return null;
            return <img className="mt-8" src={urlFor(value.asset).url()} alt="Body Image" />;
        }
    },
    block: {
        h1: ({ children }) => <h1 className="text-7xl">{children}</h1>,
        normal: ({ children }) => <p className="text-xl mt-12">{children}</p>
    }
}

const Details = ({ title, body, mainImage }) => {
    const [imageUrl, setImageUrl] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mainImage) {
            const builder = imageUrlBuilder({ projectId: '1gxdk71x', dataset: 'production' });
            setImageUrl(builder.image(mainImage).url());
        }
    }, [mainImage]);

    return (
        <div className="flex flex-col items-center mt-28">
            <h1 className="text-9xl font-Headline">{title}</h1>
            {mounted && mainImage && imageUrl && (
                <img className="mt-8 w-3/4" src={imageUrl} alt="Main Image" />
            )}
            {mounted && body && (
                <div className="w-3/4 text-xl mt-28 px-12">
                    <PortableText value={body} components={components} />
                </div>
            )}
        </div>
    );
}

export const getServerSideProps = async (pageContext) => {
    const pageSlug = pageContext.query.id;

    if (!pageSlug) {
        return {
            notFound: true
        }
    }

    const query = encodeURIComponent(`*[ _type == "post" && slug.current == "${pageSlug}" ]`);
    const url = `https://1gxdk71x.api.sanity.io/v1/data/query/production?query=${query}`;
    const result = await fetch(url).then(res => res.json());
    const post = result.result[0];

    if (!post) {
        return {
            notFound: true
        }
    } else {
        return {
            props: {
                title: post.title,
                body: post.body,
                mainImage: post.mainImage,
            }
        }
    }
}

export default Details;
