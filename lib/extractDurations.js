const path = require('path');
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
      _id,
      title,
      songs[]{
        trackTitle,
        duration,
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

      const updatedSongs = await Promise.all(album.songs.map(async (song, i) => {
        const trackUrl = song.file?.asset?.url;
        console.log(`  Song "${song.trackTitle || `Track ${i + 1}`}" URL: ${trackUrl}`);

        if (trackUrl && !song.duration) {
          console.log(`  Processing Song: ${song.trackTitle || `Track ${i + 1}`}`);

          const tempFilePath = path.join(__dirname, `temp_track_${album._id}_${i}.mp3`);

          try {
            await downloadAudio(trackUrl, tempFilePath);
            const duration = await new Promise((resolve, reject) => {
              ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) reject(err);
                else resolve(metadata.format.duration);
              });
            });

            console.log(`    Extracted Duration: ${duration} seconds`);
            return { ...song, duration };
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

      // Update all songs in the album at once
      await client
        .patch(album._id)
        .set({ songs: updatedSongs })
        .commit();

      console.log(`Updated Sanity with durations for album: ${album.title}`);
    }

    console.log('Duration extraction and update completed.');
  } catch (error) {
    console.error('Error during duration extraction:', error.message);
  }
};


// Export the main function for use in Netlify Function
module.exports = { extractAndUpdateDurations };
