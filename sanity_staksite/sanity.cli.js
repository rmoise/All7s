import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '1gxdk71x',  // Use the correct project ID from env or default
    dataset: process.env.SANITY_STUDIO_DATASET || 'production'  // Default to production if no dataset is specified
  }
});
