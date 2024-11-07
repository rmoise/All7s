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

  // Validate config
  if (!config.projectId || !config.token) {
    throw new Error('Missing required Sanity configuration');
  }

  // Initialize Sanity Client with provided config
  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset || 'production',
    token: config.token,
    useCdn: false,
    apiVersion: '2023-10-01',
  });

  try {
    // Fetch all albums that have songs
    const query = `*[_type == "album" && defined(songs)]{
      _id,
      title,
      songs[]{
        _key,
        trackTitle,
        duration,
        file{
          asset->{
            _id,
            url,
            _ref,
            mimeType
          }
        }
      }
    }`;

    const albums = await client.fetch(query);
    console.log(`Found ${albums.length} albums to process`);

    for (const album of albums) {
      console.log(`Processing Album: ${album.title} (ID: ${album._id})`);
      console.log('Songs:', JSON.stringify(album.songs, null, 2));

      const updatedSongs = await Promise.all(album.songs.map(async (song, i) => {
        const trackUrl = song.file?.asset?.url;
        console.log(`Processing song ${i + 1}/${album.songs.length}:`, {
          title: song.trackTitle,
          url: trackUrl,
          currentDuration: song.duration
        });

        if (trackUrl && !song.duration) {
          console.log(`Processing Song: ${song.trackTitle || `Track ${i + 1}`}`);

          const tempFilePath = path.join(__dirname, `temp_track_${album._id}_${i}.mp3`);

          try {
            await downloadAudio(trackUrl, tempFilePath);
            const duration = await new Promise((resolve, reject) => {
              ffmpeg.ffprobe(tempFilePath, (err, metadata) => {
                if (err) reject(err);
                else resolve(Math.round(metadata.format.duration));
              });
            });

            console.log(`Extracted Duration: ${duration} seconds`);
            return {
              ...song,
              _key: song._key,
              duration: duration
            };
          } catch (error) {
            console.error(`Error processing song "${song.trackTitle || `Track ${i + 1}`}":`, error.message);
            return song;
          } finally {
            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
              console.log(`Cleaned up temporary file.`);
            }
          }
        } else if (song.duration) {
          console.log(`Song "${song.trackTitle || `Track ${i + 1}`}" already has duration: ${song.duration} seconds`);
          return song;
        } else {
          console.log(`Song "${song.trackTitle || `Track ${i + 1}`}" has no audio URL. Skipping.`);
          return song;
        }
      }));

      // Log the update operation
      console.log('Updating Sanity with new durations:', JSON.stringify(updatedSongs, null, 2));

      try {
        await client
          .patch(album._id)
          .set({ songs: updatedSongs })
          .commit();
        console.log(`Successfully updated album: ${album.title}`);
      } catch (error) {
        console.error(`Failed to update album ${album.title}:`, error);
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
