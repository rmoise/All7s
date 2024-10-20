const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('../../lib/spotify');

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
    imageUrl: largestImage ? largestImage.url : '/images/placeholder.png',
    embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
  };
}

async function handleRequest(body) {
  const { urls } = body;

  if (!Array.isArray(urls)) {
    throw new Error('Invalid request body');
  }

  const accessToken = await getSpotifyAccessToken();

  const albumPromises = urls.map(url => {
    const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/embed\/album\/([a-zA-Z0-9]+)/);
    if (!spotifyUrlMatch) {
      return Promise.resolve(null);
    }
    const albumId = spotifyUrlMatch[1];
    return fetchAlbumData(albumId, accessToken);
  });

  const results = await Promise.all(albumPromises);
  return results.filter(result => result !== null);
}

// Next.js API route handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const results = await handleRequest(req.body);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    res.status(500).json({ error: error.message });
  }
}

// Netlify function handler
exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const results = await handleRequest(body);
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(results),
    };
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
