
export default {
    name: 'musicLink',
    title: 'Soundcloud Link',
    type: 'document',
    fields: [
        // {
        //     name:'url',
        //     title: 'URL',
        //     type: 'url'
        // },
        {
            name: 'body',
            title: 'Body',
            type: 'blockContent',
          },
        {
            name: 'image',
            title: 'Image Upload',
            type: 'image'
        },
        {
            name:'description',
            title: 'Description',
            type: 'string'
        }
    ],
  
}