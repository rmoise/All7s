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
    apiVersion: config.apiVersion,
    useCdn: false
  });

  // Helper function to wait
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to retry getting file asset
  async function getFileAssetWithRetry(ref, maxRetries = 3, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const asset = await client.fetch(`*[_id == $ref][0]`, { ref });
        if (asset?.url) {
          return asset;
        }
        console.log(`Attempt ${i + 1}: No URL found for ${ref}, waiting ${delay}ms...`);
        await wait(delay);
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i < maxRetries - 1) await wait(delay);
      }
    }
    return null;
  }

  // Query to get albums with songs
  const query = `*[_type == "album" && albumSource == "custom"] {
    _id,
    customAlbum {
      title,
      songs[] {
        _key,
        trackTitle,
        duration,
        file {
          _type,
          asset
        }
      }
    }
  }`;

  // Wait a bit for file processing
  await wait(2000);

  const albums = await client.fetch(query);
  console.log('Found albums to process:', JSON.stringify(albums, null, 2));

  for (const album of albums) {
    console.log('Processing Album:', album.customAlbum.title);

    const updatedSongs = await Promise.all(album.customAlbum.songs.map(async (song) => {
      const baseSong = {
        _key: song._key,
        trackTitle: song.trackTitle,
        duration: song.duration,
        file: {
          _type: 'file',
          asset: null
        }
      };

      if (!song.file?.asset?._ref) {
        console.log(`Song "${song.trackTitle}" has no file reference. Skipping.`);
        return baseSong;
      }

      console.log(`Getting file asset for "${song.trackTitle}":`, song.file.asset._ref);

      const fileAsset = await getFileAssetWithRetry(song.file.asset._ref);
      if (!fileAsset) {
        console.log(`Could not get file asset for "${song.trackTitle}" after retries`);
        return baseSong;
      }

      try {
        const duration = await getAudioDuration(fileAsset.url);
        console.log(`Got duration for "${song.trackTitle}":`, duration);

        return {
          ...baseSong,
          duration: duration,
          file: {
            _type: 'file',
            asset: {
              _type: 'reference',
              _ref: song.file.asset._ref
            }
          }
        };
      } catch (error) {
        console.error(`Error processing "${song.trackTitle}":`, error);
        return baseSong;
      }
    }));

    const mutation = [{
      patch: {
        id: album._id,
        set: {
          'customAlbum.songs': updatedSongs
        }
      }
    }];

    try {
      const result = await client.mutate(mutation);
      console.log(`Successfully updated album ${album.customAlbum.title}:`, result);
    } catch (error) {
      console.error(`Failed to update album ${album.customAlbum.title}:`, error);
    }
  }
}

// Helper function to get audio duration
async function getAudioDuration(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buffer = await response.arrayBuffer();

    // Look for ID3v2 header
    const view = new DataView(buffer);
    let offset = 0;

    // Check for ID3v2 header
    if (buffer.byteLength > 10 &&
        view.getUint8(0) === 0x49 && // 'I'
        view.getUint8(1) === 0x44 && // 'D'
        view.getUint8(2) === 0x33) { // '3'

      // Skip ID3v2 tag
      const size = ((view.getUint8(6) & 0x7f) << 21) |
                   ((view.getUint8(7) & 0x7f) << 14) |
                   ((view.getUint8(8) & 0x7f) << 7) |
                   (view.getUint8(9) & 0x7f);
      offset = 10 + size;
    }

    // Find first MPEG frame header
    while (offset < buffer.byteLength - 4) {
      if (view.getUint8(offset) === 0xff && (view.getUint8(offset + 1) & 0xe0) === 0xe0) {
        // Found frame header
        const version = (view.getUint8(offset + 1) & 0x18) >> 3;
        const layer = (view.getUint8(offset + 1) & 0x06) >> 1;
        const bitRateIndex = (view.getUint8(offset + 2) & 0xf0) >> 4;
        const sampleRateIndex = (view.getUint8(offset + 2) & 0x0c) >> 2;

        // Lookup tables for MPEG1 Layer III
        const bitRates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
        const sampleRates = [44100, 48000, 32000];

        const bitRate = bitRates[bitRateIndex] * 1000;
        const sampleRate = sampleRates[sampleRateIndex];

        if (bitRate && sampleRate) {
          const duration = Math.floor((buffer.byteLength * 8) / bitRate);
          console.log(`Calculated duration: ${duration} seconds`);
          return duration;
        }
        break;
      }
      offset++;
    }

    throw new Error('Could not find valid MPEG frame header');
  } catch (error) {
    console.error('Error getting audio duration:', error);
    return null;
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

async function handler(event) {
  try {
    // Parse headers and body
    const projectId = event.headers['sanity-project-id'];
    const dataset = event.headers['sanity-dataset'];
    const operation = event.headers['sanity-operation'];
    const body = JSON.parse(event.body);

    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Only process create/update operations for albums
    if (!['create', 'update'].includes(operation) || body._type !== 'album') {
      console.log('Skipping webhook: not a create/update album operation');
      return { statusCode: 200 };
    }

    // Check if there are songs with files to process
    const songs = body.customAlbum?.songs || [];
    const hasFiles = songs.some(song => song.file?.asset);

    if (!hasFiles) {
      console.log('No files to process in webhook payload');
      return { statusCode: 200 };
    }

    const client = createClient({
      projectId,
      dataset,
      token: process.env.SANITY_TOKEN,
      apiVersion: '2024-03-19',
      useCdn: false
    });

    console.log(`Processing album: ${body.customAlbum.title || body._id}`);

    // Process songs from webhook payload
    const updatedSongs = await Promise.all(songs.map(async (song) => {
      // Skip if no file or asset
      if (!song.file?.asset) {
        console.log(`Song "${song.trackTitle}" has no file. Skipping.`);
        return song;
      }

      try {
        // Get the file URL either directly or via reference
        let fileUrl = song.file.asset.url;
        if (!fileUrl && song.file.asset._ref) {
          console.log(`Fetching file asset: ${song.file.asset._ref}`);
          const fileAsset = await client.fetch(`*[_id == $ref][0]`, {
            ref: song.file.asset._ref
          });
          fileUrl = fileAsset?.url;
        }

        if (!fileUrl) {
          console.log(`No URL found for song "${song.trackTitle}"`);
          return song;
        }

        console.log(`Processing file for "${song.trackTitle}":`, fileUrl);
        const duration = await getAudioDuration(fileUrl);
        console.log(`Got duration for "${song.trackTitle}":`, duration);

        return {
          ...song,
          duration: duration,
          file: {
            _type: 'file',
            asset: song.file.asset._ref ? {
              _type: 'reference',
              _ref: song.file.asset._ref
            } : song.file.asset
          }
        };
      } catch (error) {
        console.error(`Error processing "${song.trackTitle}":`, error);
        return song;
      }
    }));

    // Update the album
    const mutation = [{
      patch: {
        id: body._id,
        set: {
          'customAlbum.songs': updatedSongs
        }
      }
    }];

    console.log('Attempting mutation:', JSON.stringify({ mutations: mutation }, null, 2));

    const result = await client.mutate(mutation);
    console.log(`Successfully updated album:`, result);

    return { statusCode: 200 };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}

exports.handler = handler;

