const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@sanity/client');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');

// Create a debug logging function that stores logs in memory
function createDebugLogger() {
  const logs = [];

  const logger = (message, data) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}: ${JSON.stringify(data, null, 2)}`;
    logs.push(logMessage);
    console.log(logMessage); // Also log to console for local development
  };

  logger.getLogs = () => logs.join('\n');

  return logger;
}

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
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion
  });

  console.log('Starting duration extraction with config:', {
    projectId: config.projectId,
    dataset: config.dataset,
    hasToken: Boolean(config.token)
  });

  // Query for albums that need duration updates
  const query = `*[_type == "album" && albumSource == "custom" && defined(customAlbum.songs) && count(customAlbum.songs[defined(file.asset) && !defined(duration)]) > 0]`;
  const albums = await client.fetch(query);

  console.log('Found', albums.length, 'albums to process:', albums);

  for (const album of albums) {
    console.log('Processing Album:', album.customAlbum.title);

    const updatedSongs = await Promise.all(album.customAlbum.songs.map(async (song, index) => {
      console.log(`Processing song ${index + 1}/${album.customAlbum.songs.length}:`, {
        title: song.trackTitle,
        fileRef: song.file?.asset?._ref,
        currentDuration: song.duration
      });

      // Get the file URL from Sanity
      if (song.file?.asset?._ref) {
        const fileUrl = await client.getDocument(song.file.asset._ref)
          .then(asset => asset?.url);

        if (!fileUrl) {
          console.log(`    Song "${song.trackTitle}" has no audio URL. Skipping.`);
          return song;
        }

        try {
          const duration = await getAudioDurationInSeconds(fileUrl);
          return {
            ...song,
            duration
          };
        } catch (error) {
          console.error(`    Error getting duration for "${song.trackTitle}":`, error);
          return song;
        }
      }
      return song;
    }));

    // Update album with new durations
    const mutation = [{
      patch: {
        id: album._id,
        set: {
          'customAlbum.songs': updatedSongs
        }
      }
    }];

    console.log('Attempting mutation:', JSON.stringify({ mutations: mutation }, null, 2));

    try {
      const result = await client.mutate(mutation);
      console.log(`Successfully updated album ${album.customAlbum.title}:`, result);
    } catch (error) {
      console.error(`Failed to update album ${album.customAlbum.title}:`, error);
    }
  }
}

async function processWebhook(event, debugLog) {
  try {
    const { headers } = event;
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Get Sanity config
    const config = {
      projectId: headers['sanity-project-id'],
      dataset: 'production',
      token: process.env.SANITY_TOKEN,
      apiVersion: '2024-03-19'
    };

    // Check for token
    if (!config.token) {
      debugLog('Error: Missing SANITY_TOKEN', {
        error: 'SANITY_TOKEN environment variable is not set'
      });
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Configuration error',
          message: 'Missing Sanity token'
        })
      };
    }

    debugLog('Starting processing with config', {
      projectId: config.projectId,
      dataset: config.dataset,
      hasToken: Boolean(config.token),
      apiVersion: config.apiVersion
    });

    await extractAndUpdateDurations(config);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };

  } catch (error) {
    debugLog('Error in processWebhook', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

exports.handler = async (event, context) => {
  const debugLog = createDebugLogger();

  try {
    debugLog('Webhook received', event);
    await processWebhook(event, debugLog);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        debug_logs: debugLog.getLogs()
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};

