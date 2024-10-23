const axios = require('axios');
const fetch = require('node-fetch');

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
    return response.data.access_token;
  } catch (error) {
    throw new Error(
      `Failed to authenticate with Spotify: ${error.response?.data || error.message}`
    );
  }
}

async function fetchAlbumData(albumId, accessToken) {
  const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!albumResponse.ok) {
    const albumError = await albumResponse.text();
    throw new Error(`Failed to fetch album data: ${albumResponse.status} ${albumResponse.statusText} - ${albumError}`);
  }

  const albumData = await albumResponse.json();

  // Find the largest image
  const largestImage = albumData.images.reduce((largest, image) => {
    return (image.width > largest.width) ? image : largest;
  }, albumData.images[0]);

  return {
    title: albumData.name,
    artist: albumData.artists[0]?.name,
    imageUrl: largestImage ? largestImage.url : '/images/placeholder.png',
    embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
    releaseType: albumData.album_type,
  };
}

async function handleRequest(body) {
  const { urls } = body;

  const accessToken = await getSpotifyAccessToken();

  // If urls is not provided, expect a single URL
  if (urls) {
    // Batch request
    return Promise.all(urls.map(url => {
      const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
      if (!spotifyUrlMatch) return Promise.resolve(null);
      const albumId = spotifyUrlMatch[1];
      return fetchAlbumData(albumId, accessToken);
    }));
  } else {
    // Single request
    const spotifyUrlMatch = body.url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
    if (!spotifyUrlMatch) throw new Error('Invalid Spotify URL');
    const albumId = spotifyUrlMatch[1];
    return fetchAlbumData(albumId, accessToken);
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const results = await handleRequest(body);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Updated CORS
      },
      body: JSON.stringify(results),
    };
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Updated CORS
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
