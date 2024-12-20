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
const WEBHOOK_EXPIRY = 60000; // 60 seconds
const MAX_RETRIES = 5; // Increase max retries
const RETRY_WINDOW = 600000; // 10 minutes window
const MAX_CONCURRENT_PROCESSES = 3; // Limit concurrent processes

// At the top of the file
const processedDocs = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute

// Add environment variable validation
function validateEnvironment() {
  console.log('Environment state:', {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
    hasToken: !!process.env.SANITY_TOKEN
  });

  const required = {
    SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
    SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
    SANITY_TOKEN: process.env.SANITY_TOKEN
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Initialize Sanity client with validation
let client;
try {
  console.log('Initializing Sanity client...');
  validateEnvironment();

  client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
    token: process.env.SANITY_AUTH_TOKEN,
    apiVersion: '2023-05-03',
    useCdn: false
  });

  console.log('Sanity client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Sanity client:', error);
  throw error;
}

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

function canProcessDocument(docId, rev) {
  const now = Date.now();
  const cacheKey = `${docId}_${rev}`;
  const lastProcessed = processedDocs.get(cacheKey);

  // Clean up old cache entries
  for (const [key, timestamp] of processedDocs.entries()) {
    if (now - timestamp > CACHE_TTL) {
      processedDocs.delete(key);
    }
  }

  if (lastProcessed && now - lastProcessed < CACHE_TTL) {
    return false;
  }

  processedDocs.set(cacheKey, now);
  return true;
}

async function getFileAssetUrl(fileAsset) {
  // If we already have a URL, return it
  if (fileAsset?.asset?.url) {
    return fileAsset.asset.url;
  }

  // If we have a reference, fetch the asset
  if (fileAsset?.asset?._ref) {
    const asset = await client.fetch(`*[_id == $ref][0]`, {
      ref: fileAsset.asset._ref
    });
    return asset?.url;
  }

  return null;
}

const rateLimit = new Map()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS = 30 // per minute

function checkRateLimit(documentId) {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // Clean old entries
  for (const [key, timestamp] of rateLimit.entries()) {
    if (timestamp < windowStart) rateLimit.delete(key)
  }

  // Count recent requests
  const recentRequests = Array.from(rateLimit.values())
    .filter(timestamp => timestamp > windowStart)
    .length

  if (recentRequests >= MAX_REQUESTS) {
    return false
  }

  rateLimit.set(`${documentId}-${now}`, now)
  return true
}

// Add debouncing for album processing
const processingQueue = new Map()
const PROCESSING_DELAY = 2000 // 2 seconds

// Add batch processing
const BATCH_SIZE = 5
const BATCH_DELAY = 1000 // 1 second between batches

async function processBatch(albums, config) {
  const batches = []
  for (let i = 0; i < albums.length; i += BATCH_SIZE) {
    batches.push(albums.slice(i, i + BATCH_SIZE))
  }

  for (const batch of batches) {
    await Promise.all(batch.map(album => extractAndUpdateDurations({ ...config, album })))
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }
  }
}

async function handler(event) {
  try {
    const body = JSON.parse(event.body)
    const albumId = body._id

    // Debounce processing
    if (processingQueue.has(albumId)) {
      clearTimeout(processingQueue.get(albumId))
    }

    const timeoutPromise = new Promise((resolve) => {
      const timeout = setTimeout(async () => {
        processingQueue.delete(albumId)
        const result = await processWebhook(event, console.log)
        resolve(result)
      }, PROCESSING_DELAY)
      processingQueue.set(albumId, timeout)
    })

    return await timeoutPromise
  } catch (error) {
    console.error('Handler error:', error)
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  }
}

exports.handler = handler;

