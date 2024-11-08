const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { extractAndUpdateDurations } = require('../../lib/extractDurations');
const { createClient } = require('@sanity/client');

// Track processed webhooks with more metadata
const processedWebhooks = new Map();
const WEBHOOK_EXPIRY = 30000; // 30 seconds
const MAX_RETRIES = 3; // Maximum number of retries per document
const RETRY_WINDOW = 300000; // 5 minutes window for retry counting

function hasContentChanged(document, headers) {
  // Skip if this is a revision-only update
  if (headers['sanity-operation'] === 'update' && document._rev?.startsWith('D6CCqayP')) {
    return false;
  }

  // Only process custom albums
  if (document._type !== 'album' || document.albumSource !== 'custom') {
    return false;
  }

  const songs = document.customAlbum?.songs || [];

  // Check for actual file changes that need duration updates
  return songs.some(song => {
    const hasAudioFile = Boolean(song.file?.asset);
    const needsDuration = !song.duration;
    return hasAudioFile && needsDuration;
  });
}

function getProcessingKey(document, headers) {
  return `${document._id}:${headers['sanity-transaction-id']}`;
}

function canProcessWebhook(document, headers) {
  const documentId = document._id;
  const now = Date.now();

  // Get all attempts for this document
  const attempts = Array.from(processedWebhooks.entries())
    .filter(([key]) => key.startsWith(documentId))
    .filter(([, metadata]) => now - metadata.timestamp < RETRY_WINDOW);

  // Count recent attempts
  if (attempts.length >= MAX_RETRIES) {
    console.log(`Maximum retries (${MAX_RETRIES}) reached for document: ${documentId}`);
    return false;
  }

  // Check if this exact transaction was already processed
  const processingKey = getProcessingKey(document, headers);
  if (processedWebhooks.has(processingKey)) {
    console.log(`Duplicate webhook detected: ${processingKey}`);
    return false;
  }

  return true;
}

function cleanupProcessedWebhooks() {
  const now = Date.now();
  for (const [key, metadata] of processedWebhooks.entries()) {
    if (now - metadata.timestamp > WEBHOOK_EXPIRY) {
      processedWebhooks.delete(key);
    }
  }
}

exports.handler = async (event, context) => {
  console.log('INFO  ', 'Webhook received:', {
    method: event.httpMethod,
    body: event.body,
    headers: event.headers
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const headers = event.headers;

    if (!hasContentChanged(body, headers)) {
      console.log('INFO  ', 'Skipping webhook - no relevant changes detected');
      return { statusCode: 200, body: 'No processing needed' };
    }

    // Get project ID from webhook headers as fallback
    const projectId = process.env.SANITY_PROJECT_ID || headers['sanity-project-id'];

    if (!projectId) {
      throw new Error('Missing Sanity project ID');
    }

    const config = {
      projectId,
      dataset: process.env.SANITY_DATASET || 'production',
      token: process.env.SANITY_TOKEN,
      useCdn: false
    };

    console.log('INFO  ', 'Starting duration extraction with config:', {
      projectId: config.projectId,
      dataset: config.dataset,
      hasToken: Boolean(config.token)
    });

    await extractAndUpdateDurations(config);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Duration update completed' })
    };

  } catch (error) {
    console.error('ERROR ', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};

