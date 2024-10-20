const axios = require('axios');
const { getSpotifyAccessToken } = require('../../lib/spotify');

exports.handler = async (event) => {
  const { url } = event.queryStringParameters;

  if (!url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing URL parameter' }) };
  }

  try {
    const albumId = url.match(/album\/([a-zA-Z0-9]+)/)?.[1];
    if (!albumId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid Spotify URL' }) };
    }

    const accessToken = await getSpotifyAccessToken();
    const { data: albumData } = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({
        title: albumData.name,
        artist: albumData.artists[0]?.name,
        imageUrl: albumData.images[0]?.url,
        embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
        releaseType: albumData.album_type,
      }),
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
