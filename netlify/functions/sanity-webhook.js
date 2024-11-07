const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { extractAndUpdateDurations } = require('../../lib/extractDurations');

exports.handler = async (event, context) => {
  console.log('Webhook received:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  // Debug log
  console.log('Environment variables:', {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
    hasToken: !!(process.env.SANITY_STUDIO_API_TOKEN || process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN),
    dataset: process.env.SANITY_STUDIO_DATASET || 'production'
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.SANITY_STUDIO_API_TOKEN || process.env.SANITY_API_READ_TOKEN || process.env.SANITY_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Missing environment variables',
        details: {
          hasProjectId: true,
          hasToken: false,
          hasDataset: true,
          availableEnvVars: Object.keys(process.env)
        }
      })
    };
  }

  try {
    console.log('Received webhook, starting duration extraction...');

    await extractAndUpdateDurations({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
      dataset: process.env.SANITY_STUDIO_DATASET || 'production',
      token: token
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Duration extraction completed successfully' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

