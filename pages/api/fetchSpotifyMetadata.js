const axios = require('axios');

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

exports.handler = async (event, context) => {
  console.log('Function invoked with event:', event);

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins for testing
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  }

  try {
    const { url } = event.queryStringParameters;
    console.log('Received URL:', url);

    if (!url) {
      throw new Error('No URL provided');
    }

    // Parse the URL to extract the pathname
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (e) {
      throw new Error('Invalid URL format');
    }

    const path = parsedUrl.pathname; // e.g., '/embed/album/7kJvKnKiwtJyp88tsancYY'
    console.log('Parsed path:', path);

    // Extract Spotify ID from the path using regex
    const embedMatch = path.match(/\/embed\/album\/([a-zA-Z0-9]{22})/);
    const directMatch = path.match(/\/album\/([a-zA-Z0-9]{22})/);
    let spotifyId;

    if (embedMatch) {
      spotifyId = embedMatch[1];
      console.log('Extracted Spotify ID from embed URL:', spotifyId);
    } else if (directMatch) {
      spotifyId = directMatch[1];
      console.log('Extracted Spotify ID from direct URL:', spotifyId);
    } else {
      throw new Error('Invalid Spotify URL format');
    }

    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken();
    console.log('Access token obtained:', accessToken);

    // Make request to Spotify API
    const response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('Spotify API response:', response.data);

    // Extract relevant information
    const { name: title, artists, images, album_type } = response.data;
    const artist = artists.map((a) => a.name).join(', ');
    const imageUrl = images[0]?.url || '';
    const releaseType = album_type;

    const result = { title, artist, imageUrl, releaseType };
    console.log('Returning result:', result);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins for testing
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in spotify-metadata function:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins for testing
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
