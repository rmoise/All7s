
import React from "react"
import getYouTubeID from 'get-youtube-id'

const Preview = ({value}) => {
    const id = getYouTubeID(value.url)
    const url = `https://www.youtube.com/embed/${id}`

    if(!id) {
        return <div>Missing YouTube URL</div>
    }

   return  (
   <iframe 
   width="560" 
   height="315" 
   src={url} 
   title="YouTube video player" 
   frameborder="0" 
   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
   modestbranding="1"
   color="white"
   rel="0"
   theme="dark"
   />

    )
   }

export default {
    name: 'youtube',
    type: 'object',
    title: 'YouTube Embed',
    fields:[ 
        {
            name: 'url',
            type: 'url',
            title: 'URL'
        },
        {
            name: 'title',
            type: 'string',
            title: 'description'
        }
    ],
    preview: {
        select: {
            url: 'url'
        },
    component: Preview,
    }
}