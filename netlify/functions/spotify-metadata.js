const axios = require('axios');

async function getSpotifyAccessToken() {
  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    throw new Error(`Failed to authenticate with Spotify: ${error.response?.data || error.message}`);
  }
}

exports.handler = async (event, context) => {
  console.log('Function invoked with event:', event);

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  }

  try {
    const { url } = event.queryStringParameters;
    console.log('Received URL:', url);

    if (!url) {
      throw new Error('No URL provided');
    }

    // Extract Spotify ID from the URL
    const match = url.match(/\/embed\/album\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error('Invalid Spotify embed URL');
    }

    const spotifyId = match[1];
    console.log('Extracted Spotify ID:', spotifyId);

    // Get Spotify access token
    const accessToken = await getSpotifyAccessToken();
    console.log('Access token obtained:', accessToken);

    // Make request to Spotify API
    const response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('Spotify API response:', response.data);

    // Extract relevant information
    const { name: title, artists, images } = response.data;
    const artist = artists.map(a => a.name).join(', ');
    const imageUrl = images[0].url;

    const result = { title, artist, imageUrl };
    console.log('Returning result:', result);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error in spotify-metadata function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
