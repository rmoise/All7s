require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@sanity/client');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Track processed webhooks with more metadata
const processedWebhooks = new Map();
const WEBHOOK_EXPIRY = 30000; // 30 seconds
const MAX_RETRIES = 3; // Maximum number of retries per document
const RETRY_WINDOW = 300000; // 5 minutes window for retry counting

function hasContentChanged(document, headers) {
  console.log('Checking document for changes:', {
    id: document._id,
    operation: headers['sanity-operation'],
    hasAudio: Boolean(document.customAlbum?.songs?.[0]?.file?.asset?._ref)
  });

  // Always process new documents
  if (headers['sanity-operation'] === 'create') {
    return true;
  }

  // Skip if this is a revision-only update
  if (headers['sanity-operation'] === 'update' && document._rev?.startsWith('D6CCqayP')) {
    return false;
  }

  // Skip draft documents
  if (document._id.startsWith('drafts.')) {
    return false;
  }

  // Only process custom albums
  if (document._type !== 'album' || document.albumSource !== 'custom') {
    return false;
  }

  const songs = document.customAlbum?.songs || [];

  // Check for actual file changes that need duration updates
  const needsUpdate = songs.some(song => {
    const hasAudioFile = Boolean(song.file?.asset?._ref);  // Check for asset reference
    const needsDuration = !song.duration;
    const shouldProcess = hasAudioFile && needsDuration;

    console.log('Checking song:', {
      hasAudioFile,
      needsDuration,
      shouldProcess,
      songKey: song._key
    });

    return shouldProcess;
  });

  return needsUpdate;
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

async function fetchAlbumsToProcess(client) {
  const query = `*[_type == "album" && albumSource == "custom" && defined(customAlbum.songs) && count(customAlbum.songs[defined(file.asset) && !defined(duration)]) > 0]`;
  return await client.fetch(query);
}

async function extractAndUpdateDurations(config) {
  console.log('Starting duration extraction with config:', {
    projectId: config.projectId,
    dataset: config.dataset,
    hasToken: Boolean(config.token)
  });

  const client = createClient(config);
  const albums = await fetchAlbumsToProcess(client);

  console.log('Found', albums.length, 'albums to process:', albums);

  for (const album of albums) {
    const { _id: albumId, customAlbum } = album;
    console.log('Processing Album:', customAlbum.title);

    if (!customAlbum.songs) {
      console.log(`Skipping album ${albumId}: No songs found`);
      continue;
    }

    const updatedSongs = await Promise.all(customAlbum.songs.map(async (song, index) => {
      const songTitle = song.trackTitle || `Track ${index + 1}`;
      const url = song.file?.asset?.url;
      console.log('Processing song', `${index + 1}/${customAlbum.songs.length}:`, {
        title: songTitle,
        url,
        currentDuration: song.duration
      });

      if (!url) {
        console.log(`    Song "${songTitle}" has no audio URL. Skipping.`);
        return song;
      }

      try {
        // Create temp file path
        const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}.mp3`);

        // Download file
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        await fs.promises.writeFile(tempFile, Buffer.from(buffer));

        // Get duration
        const duration = await getAudioDurationInSeconds(tempFile);
        console.log(`    Duration extracted: ${duration} seconds`);

        // Cleanup
        await fs.promises.unlink(tempFile);

        return {
          ...song,
          duration: Math.round(duration)
        };
      } catch (error) {
        console.error(`    Error processing song "${songTitle}":`, error);
        return song;
      }
    }));

    // Update album with new durations
    const mutation = {
      mutations: [{
        patch: {
          id: albumId,
          set: {
            'customAlbum.songs': updatedSongs
          }
        }
      }]
    };

    console.log('Attempting mutation:', JSON.stringify(mutation, null, 2));

    try {
      const result = await client.mutate(mutation);
      console.log(`Successfully updated album ${customAlbum.title}:`, result);
    } catch (error) {
      console.error(`Failed to update album ${customAlbum.title}:`, error);
    }
  }

  console.log('Duration extraction and update completed.');
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

