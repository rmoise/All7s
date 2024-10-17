// Load environment variables from .env files
require('dotenv').config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development',
});

const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../sanity_staksite/.env.development'), // Adjust this path to your .env location
});

console.log('SANITY_STUDIO_PROJECT_ID:', process.env.SANITY_STUDIO_PROJECT_ID);
console.log('SANITY_STUDIO_DATASET:', process.env.SANITY_STUDIO_DATASET);
console.log('SANITY_STUDIO_TOKEN:', process.env.SANITY_STUDIO_TOKEN);

const { createClient } = require('@sanity/client');
const ffmpeg = require('fluent-ffmpeg');
const ffprobeStatic = require('ffprobe-static');
const axios = require('axios');
const fs = require('fs');

// Configure ffmpeg to use the static ffprobe binary
ffmpeg.setFfprobePath(ffprobeStatic.path);

// Initialize Sanity Client with API version
const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID,
  dataset: process.env.SANITY_STUDIO_DATASET,
  token: process.env.SANITY_STUDIO_TOKEN,
  useCdn: false,
  apiVersion: '2023-10-01',
});

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


// Main function to extract durations and update Sanity
const extractAndUpdateDurations = async () => {
  try {
    // Fetch all albums that have songs
    const query = `*[_type == "album" && defined(songs)]{
      _id,  // Fetch the album ID
      title,
      songs[]{
        trackTitle,
        file{
          asset->{
            url
          }
        }
      }
    }`;

    const albums = await client.fetch(query);

    for (const album of albums) {
      console.log(`Processing Album: ${album.title} (ID: ${album._id})`);

      for (let i = 0; i < album.songs.length; i++) {
        const song = album.songs[i];
        const trackUrl = song.file?.asset?.url;

        console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" URL: ${trackUrl}`);

        if (trackUrl && !song.duration) { // Only process if duration is not already set
          console.log(`  Processing Song: ${song.trackTitle || `Track ${i + 1}`}`);

          // Define temporary file path
          const tempFilePath = path.join(__dirname, `temp_track_${album._id}_${i}.mp3`);

          try {
            // Download the audio file
            console.log(`    Downloading audio from: ${trackUrl}`);
            await downloadAudio(trackUrl, tempFilePath);

            // Extract duration using ffprobe
            const duration = await new Promise((resolve, reject) => {
              ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(metadata.format.duration);
                }
              });
            });

            console.log(`    Extracted Duration: ${duration} seconds`);

            // Update the song's duration in Sanity
            await client
              .patch(album._id)
              .set({
                [`songs[${i}].duration`]: duration,
              })
              .commit();

            console.log(`    Updated Sanity with duration.`);
          } catch (error) {
            console.error(`    Error processing song "${song.trackTitle || `Track ${i + 1}`}":`, error.message);
          } finally {
            // Clean up temporary file
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
              console.log(`    Cleaned up temporary file.`);
            }
          }
        } else if (song.duration) {
          console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" already has duration: ${song.duration} seconds`);
        } else {
          console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" has no audio URL. Skipping.`);
        }
      }
    }

    console.log('Duration extraction and update completed.');
  } catch (error) {
    console.error('Error during duration extraction:', error.message);
  }
};


// Run the script
extractAndUpdateDurations();
