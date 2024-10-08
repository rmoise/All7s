import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import schemas from './schemas/schema';
import DatasetSwitcher from './components/DatasetSwitcher.jsx';

// Helper function to get the default dataset
const getDefaultDataset = () => {
  // Check if running in the browser
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sanityDataset') || 'staging'; // Use localStorage for dataset on the client side
  }
  // Fallback to default on the server side
  return process.env.SANITY_STUDIO_DATASET || 'staging';
};

export default defineConfig({
  name: 'default',
  title: 'Your Project Title',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: getDefaultDataset(), // Dynamically get dataset

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
