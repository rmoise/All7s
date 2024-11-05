import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const token = process.env.SANITY_STUDIO_API_TOKEN;
const dataset = process.env.SANITY_STUDIO_DATASET || 'staging';

console.log('Using dataset:', dataset);
console.log('Token present:', !!token);

if (!token) {
  throw new Error('SANITY_STUDIO_API_TOKEN is not set in .env');
}

const client = createClient({
  projectId: '1gxdk71x',
  dataset,
  token,
  useCdn: false,
  apiVersion: '2024-03-19',
});

async function createSingletons() {
  console.log('Creating/updating singleton documents...');

  try {
    console.log('Creating settings document...');
    await client.createIfNotExists({
      _id: 'settings',
      _type: 'settings',
      title: 'ALL7Z',
      seo: {
        metaTitle: 'ALL7Z',
        metaDescription: 'ALL7Z website settings'
      },
      navbar: {
        isTransparent: true,
        navigationLinks: [
          {
            name: "Home",
            href: "/"
          }
        ]
      },
      footer: {
        copyrightText: '© 2024 ALL7Z. All rights reserved.',
        alignment: 'center',
        fontColor: {
          hex: '#FFFFFF'
        }
      }
    });
    console.log('✓ Created/ensured settings singleton');

    console.log('Creating home document...');
    await client.createIfNotExists({
      _id: 'home',
      _type: 'home',
      title: 'Home Page',
      metaTitle: 'Welcome to ALL7Z',
      metaDescription: 'Welcome to ALL7Z website'
    });
    console.log('✓ Created/ensured home singleton');

  } catch (err) {
    console.error('Error creating documents:', err);
    process.exit(1);
  }
}

// Run the creation
createSingletons().catch(console.error); 