const axios = require('axios');

export async function getSpotifyAccessToken() {
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
