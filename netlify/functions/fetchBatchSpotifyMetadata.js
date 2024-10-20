const fetch = require('node-fetch');

async function getSpotifyAccessToken() {
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
    throw new Error(`Failed to authenticate with Spotify: ${authError}`);
  }

  const { access_token: accessToken } = await authResponse.json();
  return accessToken;
}

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
    artist: albumData.artists[0]?.name,
    imageUrl: largestImage ? largestImage.url : '/images/placeholder.png',
    embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
    releaseType: albumData.album_type,
  };
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: `Method ${event.httpMethod} Not Allowed` }),
    };
  }

  const { urls } = JSON.parse(event.body);

  if (!Array.isArray(urls)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body' }),
    };
  }

  try {
    const accessToken = await getSpotifyAccessToken();

    const albumPromises = urls.map(url => {
      const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
      if (!spotifyUrlMatch) {
        return Promise.resolve(null);
      }
      const albumId = spotifyUrlMatch[1];
      return fetchAlbumData(albumId, accessToken);
    });

    const results = await Promise.all(albumPromises);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(results.filter(result => result !== null)),
    };
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
