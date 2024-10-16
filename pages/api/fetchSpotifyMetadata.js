export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/embed\/album\/([a-zA-Z0-9]+)/);
    if (!spotifyUrlMatch) {
      throw new Error('Invalid Spotify URL');
    }
    const albumId = spotifyUrlMatch[1];

    // Get Spotify access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!authResponse.ok) {
      throw new Error('Failed to authenticate with Spotify');
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Fetch album data from Spotify API
    const albumResponse = await fetch(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!albumResponse.ok) {
      throw new Error(`Failed to fetch album data: ${albumResponse.status} ${albumResponse.statusText}`);
    }

    const albumData = await albumResponse.json();
    const highResImage = albumData.images.length ? albumData.images[0].url : '/images/placeholder.png';

    res.status(200).json({
      title: albumData.name,
      imageUrl: highResImage,
      embedUrl: url,
    });
  } catch (error) {
    console.error('Error fetching Spotify metadata:', error);
    res.status(500).json({ error: error.message });
  }
}
