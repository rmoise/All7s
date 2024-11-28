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
    // Extract URL from player if needed
    if (url.includes('w.soundcloud.com/player')) {
      const urlObj = new URL(url);
      const resourceUrlEncoded = urlObj.searchParams.get('url');
      if (resourceUrlEncoded) {
        url = decodeURIComponent(resourceUrlEncoded);
      }
    }

    const baseUrl = url.split('?')[0];
    const apiUrl = `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(baseUrl)}`;

    const response = await axios.get(apiUrl);
    const { title, author_name: artist, thumbnail_url: imageUrl } = response.data;

    // Always try to get the high-res version first
    const highResImageUrl = imageUrl ? imageUrl.replace('-large', '-t500x500') : null;
    const mediumResImageUrl = imageUrl ? imageUrl.replace('-large', '-t300x300') : null;

    let finalImageUrl = null;

    // Try high res first
    if (highResImageUrl) {
      try {
        const response = await axios.head(highResImageUrl);
        if (response.status === 200) {
          finalImageUrl = highResImageUrl;
        }
      } catch {
        console.warn('High res image not accessible');
      }
    }

    // Fall back to medium res
    if (!finalImageUrl && mediumResImageUrl) {
      try {
        const response = await axios.head(mediumResImageUrl);
        if (response.status === 200) {
          finalImageUrl = mediumResImageUrl;
        }
      } catch {
        console.warn('Medium res image not accessible');
      }
    }

    // Fall back to original URL
    if (!finalImageUrl && imageUrl) {
      try {
        const response = await axios.head(imageUrl);
        if (response.status === 200) {
          finalImageUrl = imageUrl;
        }
      } catch {
        console.warn('Original image not accessible');
      }
    }

    // If all attempts fail, use placeholder
    if (!finalImageUrl) {
      finalImageUrl = '/images/music-placeholder.png';
    }

    return {
      title: title || 'Untitled SoundCloud Release',
      artist: artist || 'Unknown Artist',
      imageUrl: finalImageUrl,
      processedImageUrl: finalImageUrl,
      releaseType: 'playlist',
      embedUrl: url,
      isEmbedSupported: true
    };
  } catch (error) {
    console.error('Failed to fetch SoundCloud data:', error);
    return {
      title: 'SoundCloud Release',
      artist: 'Unknown Artist',
      imageUrl: '/images/music-placeholder.png',
      processedImageUrl: '/images/music-placeholder.png',
      releaseType: 'playlist',
      embedUrl: url,
      isEmbedSupported: true
    };
  }
}

/**
 * Add this new function to handle Spotify tracks
 * @param {string} trackId - The Spotify track ID.
 * @param {string} accessToken - The Spotify access token.
 * @returns {Promise<Object>} The track data.
 */
async function fetchSpotifyTrackData(trackId, accessToken) {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { name: title, artists, album } = response.data;
    const artist = artists.map((a) => a.name).join(', ');
    const largestImage = album.images.length > 0 ? album.images[0].url : '/images/placeholder.png';

    return {
      title,
      artist,
      imageUrl: largestImage,
      embedUrl: `https://open.spotify.com/embed/track/${trackId}`,
      releaseType: 'single',
      isEmbedSupported: true,
    };
  } catch (error) {
    console.error(
      `Failed to fetch track data for Spotify ID ${trackId}:`,
      error.response?.data?.error || error.message
    );
    throw error;
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
    'http://localhost:3000',
    'https://all7z.sanity.studio',
    'https://all7z.com',
    'https://www.all7z.com',
    'https://i1.sndcdn.com',
    'https://i2.sndcdn.com',
    'https://i3.sndcdn.com',
    'https://i4.sndcdn.com'
  ];

  const origin = event.headers.origin;
  const allowOriginHeader = allowedOrigins.includes(origin) ? origin : 'null';

  const defaultHeaders = {
    'Access-Control-Allow-Origin': allowOriginHeader,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
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
        const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
        const albumMatch = url.match(/album\/([a-zA-Z0-9]+)/);

        if (!trackMatch && !albumMatch) {
          return {
            statusCode: 400,
            headers: defaultHeaders,
            body: JSON.stringify({ error: 'Invalid Spotify URL' }),
          };
        }

        const accessToken = await getSpotifyAccessToken();

        if (trackMatch) {
          metadata = await fetchSpotifyTrackData(trackMatch[1], accessToken);
        } else {
          metadata = await fetchSpotifyAlbumData(albumMatch[1], accessToken);
        }
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
