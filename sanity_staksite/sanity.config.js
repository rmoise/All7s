import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { colorInput } from '@sanity/color-input';  // Import color input plugin
import schemas from './schemas/schema';
import DatasetSwitcher from './components/DatasetSwitcher.jsx';

// Helper function to get the default dataset
const getDefaultDataset = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sanityDataset') || 'staging';
  }
  return process.env.SANITY_STUDIO_DATASET || 'staging';
};

export default defineConfig({
  name: 'default',
  title: 'Your Project Title',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: getDefaultDataset(),

  schema: {
    types: schemas,
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
    visionTool(),
    colorInput(),  // Add color input plugin here
  ],
});
