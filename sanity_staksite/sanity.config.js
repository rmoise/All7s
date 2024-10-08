import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import schemas from './schemas/schema';
import DatasetSwitcher from './components/DatasetSwitcher.jsx';

// Default to staging dataset unless explicitly specified in localStorage
const defaultDataset = localStorage.getItem('sanityDataset') || 'staging';

export default defineConfig({
  name: 'default',
  title: 'Your Project Title',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: defaultDataset, // Use dataset from localStorage or default to staging

  schema: {
    types: schemas, // Include your schema types here
  },

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Switch Dataset')
              .child(
                S.component()
                  .component(DatasetSwitcher)
                  .title('Switch between Datasets')
              ),
            S.divider(),
            ...S.documentTypeListItems(),
          ]),
    }),
    visionTool(), // Optional: include visionTool if needed
  ],
});
