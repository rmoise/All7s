export default {
  name: 'about',
  title: 'About - (Note: Styling is fixed. Editor controls will not work here)',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{type: 'block'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
    },
  },
  initialValue: () => ({
    // Ensure unique ID for each dataset
    _id: `${process.env.NEXT_PUBLIC_ENVIRONMENT}-about`,  // Staging or Production ID
  })
};
