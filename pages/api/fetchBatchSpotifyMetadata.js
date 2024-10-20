import { getSpotifyAccessToken } from '../../lib/spotify'; // We'll create this helper function

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { urls } = req.body;

  if (!Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
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

    // CORS Header
    res.setHeader('Access-Control-Allow-Origin', '*');

    res.status(200).json(results.filter(result => result !== null));
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    res.status(500).json({ error: error.message });
  }
}
