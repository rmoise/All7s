const axios = require('axios');
const { getSpotifyAccessToken } = require('../../lib/spotify');

exports.handler = async (event) => {
  const allowedOrigins = [
    'http://localhost:3333', // Sanity Studio local development
    'https://all7z.sanity.studio', // Your deployed Sanity Studio URL
    'https://staging--all7z.netlify.app',
    'https://all7z.netlify.app',
  ];

  const origin = event.headers.origin;
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    };
  }

  console.log('Function started');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Query Parameters:', JSON.stringify(event.queryStringParameters, null, 2));
  console.log('Body:', event.body);

  let url;
  if (event.queryStringParameters && event.queryStringParameters.url) {
    try {
      url = decodeURIComponent(event.queryStringParameters.url);
      console.log('Decoded URL:', url);
    } catch (error) {
      console.error('Error decoding URL:', error);
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid URL encoding' })
      };
    }
  } else if (event.body) {
    try {
      const body = JSON.parse(event.body);
      url = body.url;
      console.log('URL from body:', url);
    } catch (error) {
      console.error('Error parsing body:', error);
    }
  }

  if (!url || typeof url !== 'string') {
    console.log('No valid URL provided');
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Missing or invalid URL parameter' })
    };
  }

  // Extract Spotify URL from iframe if present
  const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/embed\/album\/([a-zA-Z0-9]+)/);
  if (spotifyUrlMatch) {
    url = `https://open.spotify.com/album/${spotifyUrlMatch[1]}`;
  }

  console.log('Extracted Spotify URL:', url);

  try {
    console.log('Attempting to extract album ID');
    const albumId = url.match(/album\/([a-zA-Z0-9]+)/)?.[1];
    if (!albumId) {
      console.log('Invalid Spotify URL');
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Invalid Spotify URL' })
      };
    }

    console.log('Album ID:', albumId);
    console.log('Fetching Spotify access token');
    const accessToken = await getSpotifyAccessToken();
    console.log('Access token obtained');

    console.log('Fetching album data from Spotify API');
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const albumData = response.data;
    console.log('Album data:', JSON.stringify(albumData, null, 2));
    console.log('Successfully fetched album data');

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // Add CORS header
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message, stack: error.stack })
    };
  }
};
