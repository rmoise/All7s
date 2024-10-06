import { client, urlFor } from '../../lib/client'
import post from '../../sanity_staksite/schemas/post'
import { PortableText } from '@portabletext/react'
import { useState, useEffect } from 'react'
import imageUrlBuilder from '@sanity/image-url'

// const bodyImageComponent = {

// }

const components = {
    types: {
        image:({value}) => <img className="mt-8" src={urlFor(value.asset)}/>,

    },

    block: {
        h1:({children}) => <h1 className="text-7xl">{children}</h1>,
        normal: ({children})=><p className="text-xl mt-12">{children}</p>
    }

}

const Details = ({title, body, mainImage }) => {
    const [imageUrl, setImageUrl] = useState ('');


useEffect(()=>{
    const builder=imageUrlBuilder({client})
    function urlFor() {
        return builder.image()
    }
})

    useEffect(() => {
    const imgBuilder = imageUrlBuilder({
        projectId: '1gxdk71x',
        dataset: 'production'
         })

    setImageUrl(imgBuilder.image(mainImage))
    }, [mainImage]);

    return (
       <div className="flex flex-col items-center mt-28">
        <h1 className="text-9xl font-Headline">{title}</h1>
        {imageUrl && <img className="mt-8 w-3/4" src={imageUrl}/>}
        <p className="w-3/4 text-xl mt-28 px-12"></p>

       <div className="mt-20 portable-text flex flex-col gap-y-30">
        <PortableText value={body} components={components}/>
        </div>

        {/* {console.log(bodyImageComponent.types.image)} */}

     </div>
    )
}

export const getServerSideProps = async pageContext => {
    const pageSlug = pageContext.query.id
    // console.log(pageSlug)

    if (!pageSlug) {
        return {
            notFound: true
        }
    }

    const query = encodeURIComponent(`*[ _type == "post" && slug.current == "${pageSlug}" ]`);
    const url=`https://1gxdk71x.api.sanity.io/v1/data/query/production?query=${query}`
    const result = await fetch(url).then(res => res.json());
    const post = result.result[0]
    // console.log(post)


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