import { defineConfig } from 'sanity'; // Sanity v3 import
import DatasetSwitcher from './components/DatasetSwitcher.jsx'; // Import your dataset switcher component

export default defineConfig({
  name: 'default',
  title: 'Your Project Title',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,

  schema: {
    types: [], // Include your types here
  },

  structure: (S) =>
    S.list()
      .title('Content')
      .items([
        S.listItem()
          .title('Switch Dataset') // Title of your dataset switcher tool
          .child(
            S.component()
              .component(DatasetSwitcher) // Include your custom dataset switcher here
              .title('Switch between Datasets')
          ),
        S.divider(), // Optional: adds a visual divider
        ...S.documentTypeListItems(), // Automatically list all document types
      ]),
});
