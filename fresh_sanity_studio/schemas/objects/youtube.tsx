import React from "react"
import getYouTubeId from 'get-youtube-id'
import { defineType, defineField } from 'sanity'

const PreviewComponent = ({value}: {value: {url: string}}) => {
    const id = getYouTubeId(value.url)
    const thumbnailUrl = id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : undefined

    if(!id || !thumbnailUrl) {
        return <div>Missing YouTube URL</div>
    }

    return (
        <div style={{ marginTop: '10px' }}>
            <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                style={{
                    width: '200px',
                    height: 'auto',
                    borderRadius: '4px'
                }}
            />
        </div>
    )
}

export default defineType({
    name: 'youtube',
    type: 'object',
    title: 'YouTube Embed',
    fields: [
        defineField({
            name: 'url',
            type: 'url',
            title: 'URL',
            validation: Rule => Rule.required(),
            components: {
                input: PreviewComponent as any,
            },
        }),
        defineField({
            name: 'title',
            type: 'string',
            title: 'Description'
        })
    ],
    preview: {
        select: {
            url: 'url',
            title: 'title'
        },
        prepare({ url, title }) {
            return {
                title: title || 'YouTube Video',
                subtitle: url,
                media: PreviewComponent({ value: { url } })
            }
        }
    }
}) 