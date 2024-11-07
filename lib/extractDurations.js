require('dotenv').config();

const path = require('path');
const os = require('os');
const { createClient } = require('@sanity/client');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const axios = require('axios');
const fs = require('fs');
const { getAudioDurationInSeconds } = require('get-audio-duration');
const fetch = require('node-fetch');

// Configure ffmpeg to use the static ffprobe binary
ffmpeg.setFfprobePath(ffprobeStatic.path);

const getTempFilePath = (albumId, songIndex) => {
  return path.join(os.tmpdir(), `temp_track_${albumId}_${songIndex}.mp3`);
};

const extractDuration = async (url, songTitle, albumId, songIndex) => {
  if (!url) {
    console.log(`    Song "${songTitle}" has no audio URL. Skipping.`);
    return null;
  }

  console.log(`    Processing Song: ${songTitle || `Track ${songIndex + 1}`}`);
  const tempPath = getTempFilePath(albumId, songIndex);

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(tempPath, Buffer.from(buffer));

    const duration = await getAudioDurationInSeconds(tempPath);
    console.log(`    Duration extracted: ${duration} seconds`);

    // Clean up temp file
    await fs.promises.unlink(tempPath);

    return duration;
  } catch (error) {
    console.error(`    Error processing song "${songTitle}":`, error);
    // Attempt cleanup even if there was an error
    try {
      await fs.promises.unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    return null;
  }
};

const extractAndUpdateDurations = async (config) => {
  console.log('Starting duration extraction with config:', {
    projectId: config.projectId,
    dataset: config.dataset,
    hasToken: !!config.token
  });

  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset || 'production',
    token: config.token,
    useCdn: false,
    apiVersion: '2023-10-01',
  });

  try {
    // Updated query with correct asset reference structure
    const query = `*[_type == "album" && albumSource == "custom"]{
      _id,
      albumSource,
      customAlbum{
        title,
        songs[]{
          _key,
          trackTitle,
          duration,
          file{
            asset->{
              url,
              mimeType
            }
          }
        }
      }
    }`;

    const albums = await client.fetch(query);
    console.log(`Found ${albums.length} albums to process:`, JSON.stringify(albums, null, 2));

    for (const album of albums) {
      if (!album.customAlbum?.songs?.length) {
        console.log(`Skipping album ${album._id}: No songs found`);
        continue;
      }

      console.log(`Processing Album: ${album.customAlbum.title || album._id}`);

      const updatedSongs = await Promise.all(album.customAlbum.songs.map(async (song, i) => {
        const trackUrl = song.file?.asset?.url;
        console.log(`Processing song ${i + 1}/${album.customAlbum.songs.length}:`, {
          title: song.trackTitle,
          url: trackUrl,
          currentDuration: song.duration
        });

        if (trackUrl && !song.duration) {
          console.log(`  Processing Song: ${song.trackTitle || `Track ${i + 1}`}`);
          const duration = await extractDuration(trackUrl, song.trackTitle, album._id, i);

          if (duration) {
            return {
              ...song,
              _key: song._key,
              duration: duration
            };
          } else {
            console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" has no audio URL. Skipping.`);
            return song;
          }
        } else if (song.duration) {
          console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" already has duration: ${song.duration} seconds`);
          return song;
        } else {
          console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" has no audio URL. Skipping.`);
          return song;
        }
      }));

      try {
        const mutation = {
          mutations: [{
            patch: {
              id: album._id,
              set: {
                'customAlbum.songs': updatedSongs
              }
            }
          }]
        };

        console.log('Attempting mutation:', JSON.stringify(mutation, null, 2));

        const result = await client.request({
          url: '/data/mutate/production',
          method: 'POST',
          body: mutation
        });

        console.log(`Successfully updated album ${album.customAlbum.title || album._id}:`, result);
      } catch (error) {
        console.error(`Failed to update album ${album.customAlbum.title || album._id}:`, {
          error: error.message,
          status: error.statusCode,
          details: error.details,
          response: error.responseBody
        });
        throw error;
      }
    }

    console.log('Duration extraction and update completed.');
  } catch (error) {
    console.error('Error in duration extraction:', error);
    throw error;
  }
};

// Helper function to download audio file
const downloadAudio = async (url, outputPath) => {
  try {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    console.log(`Downloading file from: ${url}`);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`Download complete: ${outputPath}`);
        resolve();
      });
      writer.on('error', (error) => {
        console.error(`Error downloading file: ${error.message}`);
        reject(error);
      });
    });
  } catch (error) {
    console.error(`Error in downloadAudio: ${error.message}`);
  }
};

// Export the main function for use in Netlify Function
module.exports = { extractAndUpdateDurations };
