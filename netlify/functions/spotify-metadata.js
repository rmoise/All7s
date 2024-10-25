// netlify/functions/spotify-metadata.js

const axios = require('axios');

/**
 * Retrieves a Spotify access token using Client Credentials Flow.
 * @returns {Promise<string>} The access token.
 */
async function getSpotifyAccessToken() {
  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    );

    console.log('Obtained Spotify Access Token:', response.data.access_token);

    return response.data.access_token;
  } catch (error) {
    console.error('Failed to authenticate with Spotify:', error.response?.data?.error_description || error.message);
    throw new Error(
      `Failed to authenticate with Spotify: ${error.response?.data?.error_description || error.message}`
    );
  }
}

/**
 * Fetches album data from Spotify API.
 * @param {string} albumId - The Spotify album ID.
 * @param {string} accessToken - The Spotify access token.
 * @returns {Promise<Object>} The album data.
 */
async function fetchAlbumData(albumId, accessToken) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { name: title, artists, images, album_type } = response.data;
    const artist = artists.map((a) => a.name).join(', ');

    // Log all available images for debugging
    console.log(`All available images for album ID ${albumId}:`, images);

    if (!images || images.length === 0) {
      console.warn(`No images found for album ID ${albumId}. Using placeholder.`);
      return {
        title,
        artist,
        imageUrl: '/images/placeholder.png',
        embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
        releaseType: album_type,
      };
    }

    // Select the largest image available (Spotify typically provides up to 640x640)
    const largestImage = images.reduce((largest, image) => {
      return image.width > largest.width ? image : largest;
    }, images[0]);

    console.log(`Selected largest image for album ID ${albumId}:`, largestImage.url);

    return {
      title,
      artist,
      imageUrl: largestImage?.url || '/images/placeholder.png',
      embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
      releaseType: album_type,
    };
  } catch (error) {
    console.error(`Failed to fetch album data for ID ${albumId}:`, error.response?.data?.error || error.message);
    throw new Error(
      `Failed to fetch album data for ID ${albumId}: ${error.response?.data?.error || error.message}`
    );
  }
}

/**
 * Handler function to process incoming requests.
 * Supports both GET (single URL) and POST (multiple URLs) methods.
 */
exports.handler = async (event, context) => {
  const defaultHeaders = {
    'Access-Control-Allow-Origin': '*', // Update this to your specific origin in production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: '',
    };
  }

  try {
    // Obtain Spotify access token
    const accessToken = await getSpotifyAccessToken();

    if (event.httpMethod === 'GET') {
      // Handle GET request for a single URL
      const { url } = event.queryStringParameters || {};
      if (!url) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'No URL provided' }),
        };
      }

      // Extract Spotify Album ID
      const albumIdMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
      if (!albumIdMatch) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'Invalid Spotify URL' }),
        };
      }

      const albumId = albumIdMatch[1];
      console.log(`Fetching data for album ID: ${albumId}`);

      const albumData = await fetchAlbumData(albumId, accessToken);

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(albumData),
      };
    } else if (event.httpMethod === 'POST') {
      // Handle POST request for multiple URLs
      const { urls } = JSON.parse(event.body || '{}');

      if (!Array.isArray(urls)) {
        return {
          statusCode: 400,
          headers: defaultHeaders,
          body: JSON.stringify({ error: 'Invalid request body: "urls" should be an array' }),
        };
      }

      // Process all URLs concurrently
      const albumPromises = urls.map(async (url) => {
        try {
          const albumIdMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
          if (!albumIdMatch) {
            console.warn(`Invalid Spotify URL skipped: ${url}`);
            return null; // Skip invalid URLs
          }
          const albumId = albumIdMatch[1];
          console.log(`Fetching data for album ID: ${albumId}`);
          return await fetchAlbumData(albumId, accessToken);
        } catch (error) {
          console.error(`Error processing URL "${url}":`, error.message);
          return null; // Skip URLs that cause errors
        }
      });

      const albums = await Promise.all(albumPromises);
      const filteredAlbums = albums.filter((album) => album !== null);

      console.log('Final processed albums:', filteredAlbums);

      return {
        statusCode: 200,
        headers: defaultHeaders,
        body: JSON.stringify(filteredAlbums),
      };
    } else {
      // Method not allowed
      return {
        statusCode: 405,
        headers: defaultHeaders,
        body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
      };
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
