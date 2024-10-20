const axios = require('axios');
const { getSpotifyAccessToken } = require('../../lib/spotify');

exports.handler = async (event) => {
  console.log('Function started');
  console.log('Received event:', JSON.stringify(event, null, 2));
  console.log('Query string parameters:', JSON.stringify(event.queryStringParameters, null, 2));
  const { url } = event.queryStringParameters || {};
  console.log('Received URL:', url);

  if (!url || url.trim() === '') {
    console.log('No URL provided or empty URL');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or empty URL parameter' })
    };
  }

  try {
    console.log('Attempting to extract album ID');
    const albumId = url.match(/album\/([a-zA-Z0-9]+)/)?.[1];
    console.log('Extracted album ID:', albumId);
    if (!albumId) {
      console.log('Invalid Spotify URL');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid Spotify URL' })
      };
    }

    console.log('Attempting to get Spotify access token');
    const accessToken = await getSpotifyAccessToken();
    console.log('Obtained Spotify access token');

    console.log('Fetching album data from Spotify API');
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('Spotify API response status:', response.status);

    if (response.status !== 200) {
      console.error('Spotify API error:', response.status, response.statusText);
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Spotify API error', details: response.statusText })
      };
    }

    const albumData = response.data;
    console.log('Successfully fetched album data');

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: albumData.name,
        artist: albumData.artists[0]?.name,
        imageUrl: albumData.images[0]?.url,
        embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
        releaseType: albumData.album_type,
      })
    };
  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack })
    };
  }
};
