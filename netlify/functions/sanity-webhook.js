const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { extractAndUpdateDurations } = require('../../lib/extractDurations');
const { createClient } = require('@sanity/client');

const processedWebhooks = new Map();

function hasContentChanged(document) {
  if (document._type !== 'album' || document.albumSource !== 'custom') {
    return false;
  }

  const songs = document.customAlbum?.songs || [];
  return songs.some(song =>
    song.file?.asset && // Has an audio file
    song.duration === null // Duration needs to be extracted
  );
}

exports.handler = async (event, context) => {
  console.log('Webhook received:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.SANITY_TOKEN || process.env.SANITY_STUDIO_API_TOKEN || process.env.SANITY_API_READ_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing token' })
    };
  }

  try {
    const body = JSON.parse(event.body);

    // Skip if no meaningful content changes
    if (!hasContentChanged(body)) {
      console.log('Skipping webhook - no relevant changes detected');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'No processing needed' })
      };
    }

    const documentId = body._id;
    const rev = body._rev;
    const processingKey = `${documentId}:${rev}`;
    const now = Date.now();

    if (processedWebhooks.has(processingKey)) {
      console.log(`Skipping duplicate update for ${processingKey}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Already processed' })
      };
    }

    processedWebhooks.set(processingKey, now);

    // Cleanup old entries
    for (const [key, timestamp] of processedWebhooks.entries()) {
      if (now - timestamp > 30000) {
        processedWebhooks.delete(key);
      }
    }

    console.log('Received webhook, starting duration extraction...');

    await extractAndUpdateDurations({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1gxdk71x',
      dataset: process.env.SANITY_STUDIO_DATASET || 'production',
      token: token
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

