import { defineType } from 'sanity';

export default defineType({
    name: 'heroVideo',
    title: 'Hero Video YouTube Link',
    type: 'document',
    fields: [
        {
            name: 'url',
            title: 'URL',
            type: 'url'
        },
        {
            name: 'description',
            title: 'Description',
            type: 'string'
        }
    ]
});
