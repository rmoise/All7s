const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { extractAndUpdateDurations } = require('../../lib/extractDurations');
const { createClient } = require('@sanity/client');

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
  console.log('Token debug:', {
    length: token?.length,
    prefix: token?.substring(0, 5) + '...',
    source: process.env.SANITY_STUDIO_API_TOKEN ? 'STUDIO' :
            process.env.SANITY_API_READ_TOKEN ? 'READ' :
            process.env.SANITY_TOKEN ? 'TOKEN' : 'NONE'
  });

  const testClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
    token: token,
    useCdn: false,
    apiVersion: '2023-10-01',
  });

  // Test write permissions
  try {
    console.log('Testing write permissions...');
    await testClient.patch('534abaf6-4546-401e-9265-d6b44cf02459')
      .set({_type: 'album'})
      .commit();
    console.log('Write permission test successful');
  } catch (error) {
    console.error('Write permission test failed:', {
      error: error.message,
      details: error.details,
      response: error.response?.statusCode,
      body: error.responseBody
    });
  }

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

