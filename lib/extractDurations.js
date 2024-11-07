require('dotenv').config();

const path = require('path');
const { createClient } = require('@sanity/client');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const axios = require('axios');
const fs = require('fs');

// Configure ffmpeg to use the static ffprobe binary
ffmpeg.setFfprobePath(ffprobeStatic.path);

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
          const tempFilePath = path.join(__dirname, `temp_track_${album._id}_${i}.mp3`);

          try {
            await downloadAudio(trackUrl, tempFilePath);
            const duration = await new Promise((resolve, reject) => {
              ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) reject(err);
                else resolve(Math.round(metadata.format.duration));
              });
            });

            console.log(`    Extracted Duration: ${duration} seconds`);
            return {
              ...song,
              _key: song._key,
              duration: duration
            };
          } catch (error) {
            console.error(`    Error processing song "${song.trackTitle || `Track ${i + 1}`}":`, error.message);
            return song;
          } finally {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
              console.log(`    Cleaned up temporary file.`);
            }
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
          response: error.responseBody,
          mutation: mutation
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
