const fetch = require('node-fetch');

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

    // Get Spotify access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Spotify auth error:', authError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: `Failed to authenticate with Spotify: ${authError}` }),
      };
    }

    const { access_token: accessToken } = await authResponse.json();

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
