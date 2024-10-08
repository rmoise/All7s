export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: {type: 'author'},
    },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },

    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{type: 'reference', to: {type: 'category'}}],
    },
   
    {
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    },

    // {
    //   title: "Color List",
    //   description: "Pick a color",
    //   name: "colors",
    //   type: "color", // required
    //   options: {
    //     list: [
    //       { title: "Red", value: "#f16d70" },
    //       { title: "Teal", value: "#88c6db" },
    //       { title: "Purple", value: "#aca0cc" },
    //       { title: "Green", value: "#bdcdcb" },
    //       { title: "White", value: "white" }
    //     ]
    //   }
    // },


  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      })
    },
  },
}
