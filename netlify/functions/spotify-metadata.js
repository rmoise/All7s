const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../../lib/spotify');

exports.handler = async (event, context) => {
  const { url } = event.queryStringParameters;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing URL parameter' }),
    };
  }

  try {
    const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
    if (!spotifyUrlMatch) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid Spotify URL' }),
      };
    }
    const albumId = spotifyUrlMatch[1];

    // Get Spotify access token using the imported function
    const accessToken = await getSpotifyAccessToken();

    // Fetch album data from Spotify API
    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!albumResponse.ok) {
      const albumError = await albumResponse.text();
      console.error('Spotify album fetch error:', albumError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to fetch album data: ${albumResponse.status} ${albumResponse.statusText}` }),
      };
    }

    const albumData = await albumResponse.json();

    const responseData = {
      title: albumData.name,
      artist: albumData.artists[0]?.name,
      imageUrl: albumData.images[0]?.url,
      embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
      releaseType: albumData.album_type,
    };

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
