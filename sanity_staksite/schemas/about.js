

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
        of: [{type: 'block'}]
       },
       
        // of: [
        //     {
        //         type: 'block', 
        //         marks: {
        //             annotations: [
        //                 {name: 'color', title: 'Color', type: 'color'}
        //             ]
        //         }
        //     }
        // ]
    
    
    ],
    preview: {
        select: {
          title: 'title',
        },
    }
}