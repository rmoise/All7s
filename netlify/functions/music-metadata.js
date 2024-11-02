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
    console.error(
      'Failed to authenticate with Spotify:',
      error.response?.data?.error_description || error.message
    );
    throw new Error(
      `Failed to authenticate with Spotify: ${
        error.response?.data?.error_description || error.message
      }`
    );
  }
}

/**
 * Fetches album data from Spotify API.
 * @param {string} albumId - The Spotify album ID.
 * @param {string} accessToken - The Spotify access token.
 * @returns {Promise<Object>} The album data.
 */
async function fetchSpotifyAlbumData(albumId, accessToken) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { name: title, artists, images, album_type } = response.data;
    const artist = artists.map((a) => a.name).join(', ');

    const largestImage = images.length > 0 ? images[0].url : '/images/placeholder.png';

    return {
      title,
      artist,
      imageUrl: largestImage,
      embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
      releaseType: album_type,
      isEmbedSupported: true, // Indicate that embedding is supported
    };
  } catch (error) {
    console.error(
      `Failed to fetch album data for Spotify ID ${albumId}:`,
      error.response?.data?.error || error.message
    );
    throw new Error(
      `Failed to fetch album data for Spotify ID ${albumId}: ${
        error.response?.data?.error || error.message
      }`
    );
  }
}

/**
 * Fetches metadata from SoundCloud using the oEmbed endpoint.
 * @param {string} url - The SoundCloud URL.
 * @returns {Promise<Object>} The SoundCloud metadata.
 */
async function fetchSoundCloudData(url) {
  try {
    // If the URL is a SoundCloud player URL, extract the 'url' parameter
    if (url.includes('w.soundcloud.com/player')) {
      const urlObj = new URL(url);
      const resourceUrlEncoded = urlObj.searchParams.get('url');
      if (resourceUrlEncoded) {
        url = decodeURIComponent(resourceUrlEncoded);
      } else {
        throw new Error('Unable to extract resource URL from SoundCloud player URL.');
      }
    }

    // Sanitize the URL by removing query parameters
    const baseUrl = url.split('?')[0];
    const apiUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(baseUrl)}`;

    console.log(`Fetching SoundCloud metadata from: ${apiUrl}`);

    const response = await axios.get(apiUrl);

    const { title, author_name: artist, thumbnail_url: imageUrl } = response.data;

    // Validate the fetched data
    if (!title || !artist) {
      throw new Error('Incomplete metadata received from SoundCloud.');
    }

    return {
      title: title || 'Untitled SoundCloud Release',
      artist: artist || 'Unknown Artist',
      imageUrl: imageUrl || 'https://example.com/soundcloud-placeholder.png',
      releaseType: 'playlist',
      embedUrl: baseUrl, // Use the base URL as the embed URL
      isEmbedSupported: false, // Indicate that embedding is not supported
    };
  } catch (error) {
    console.error(`Failed to fetch SoundCloud data for URL ${url}:`, error.message);
    return {
      title: 'SoundCloud Release',
      artist: 'Unknown Artist',
      imageUrl: 'https://example.com/soundcloud-placeholder.png',
      releaseType: 'playlist',
      embedUrl: url, // Provide the original URL
      isEmbedSupported: false,
    };
  }
}

/**
 * Main handler function to process incoming requests.
 * Supports both Spotify and SoundCloud URLs.
 */
exports.handler = async (event, context) => {
  // Define allowed origins based on environment
  const allowedOrigins = [
    'http://localhost:3333',
    'https://all7z.sanity.studio',
    'https://all7z.com',
  ];

  const origin = event.headers.origin;
  const allowOriginHeader = allowedOrigins.includes(origin) ? origin : 'null';

  const defaultHeaders = {
    'Access-Control-Allow-Origin': allowOriginHeader,
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
    const { url } = event.queryStringParameters || {};

    if (!url) {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({ error: 'No URL provided' }),
      };
    }

    let metadata;

    if (url.includes('spotify.com') || url.includes('soundcloud.com')) {
      if (url.includes('spotify.com')) {
        const albumIdMatch = url.match(/album\/([a-zA-Z0-9]+)/);
        if (!albumIdMatch) {
          return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({ error: 'Invalid Spotify URL' }),
          };
        }
        const accessToken = await getSpotifyAccessToken();
        metadata = await fetchSpotifyAlbumData(albumIdMatch[1], accessToken);
      } else if (url.includes('soundcloud.com')) {
        metadata = await fetchSoundCloudData(url);
      }
    } else {
      return {
        statusCode: 400,
        headers: defaultHeaders,
        body: JSON.stringify({
          error: 'Unsupported URL. Please provide a Spotify or SoundCloud URL.',
        }),
      };
    }

    return {
      statusCode: 200,
      headers: defaultHeaders,
      body: JSON.stringify(metadata),
    };
  } catch (error) {
    console.error('Error processing request:', error.message);
    return {
      statusCode: 500,
      headers: defaultHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
