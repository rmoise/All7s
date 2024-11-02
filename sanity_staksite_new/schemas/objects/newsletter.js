import { defineType } from 'sanity';

export default defineType({
  name: 'newsletter',
  title: 'Newsletter',
  type: 'object',
  fields: [
    {
      name: 'headline',
      title: 'Headline',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'string',
    },
    {
      name: 'ctaText',
      title: 'CTA Text',
      type: 'string',
    },
    {
      name: 'placeholderText',
      title: 'Placeholder Text',
      type: 'string',
    },
    {
      name: 'formName',
      title: 'Form Name',
      type: 'string',
      description: 'Name attribute for the form, for example, "newsletter"',
    },
  ],
preview: {
    select: {
      title: 'heading',
    },
    prepare(selection) {
      const { title } = selection;
      return {
        title: title || 'Newsletter Section',
      };
    },
  },
});
