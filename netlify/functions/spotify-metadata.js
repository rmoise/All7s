const axios = require('axios');
const { getSpotifyAccessToken } = require('../../lib/spotify');

exports.handler = async (event) => {
  console.log('Received event:', event);
  const { url } = event.queryStringParameters;
  console.log('Received URL:', url);

  if (!url) {
    console.log('No URL provided');
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing URL parameter' })
    };
  }

  try {
    const albumId = url.match(/album\/([a-zA-Z0-9]+)/)?.[1];
    console.log('Extracted album ID:', albumId);
    if (!albumId) {
      console.log('Invalid Spotify URL');
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
