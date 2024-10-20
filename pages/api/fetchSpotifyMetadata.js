import Cors from 'cors'

// Initializing the cors middleware
const cors = Cors({
  methods: ['GET', 'HEAD'],
  origin: true, // Allow all origins
  credentials: true, // Allow credentials
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

export default async function handler(req, res) {
  // Run the middleware
  await runMiddleware(req, res, cors)

  console.log('API route called with URL:', req.query.url);

  res.setHeader('Content-Type', 'application/json');

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  try {
    const spotifyUrlMatch = url.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
    if (!spotifyUrlMatch) {
      return res.status(400).json({ error: 'Invalid Spotify URL' });
    }
    const albumId = spotifyUrlMatch[1];

    console.log('Extracted album ID:', albumId);

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
      return res.status(500).json({ error: `Failed to authenticate with Spotify: ${authError}` });
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
      return res.status(500).json({ error: `Failed to fetch album data: ${albumResponse.status} ${albumResponse.statusText}` });
    }

    const albumData = await albumResponse.json();

    const responseData = {
      title: albumData.name,
      artist: albumData.artists[0]?.name,
      imageUrl: albumData.images[0]?.url,
      embedUrl: `https://open.spotify.com/embed/album/${albumId}`,
      releaseType: albumData.album_type,
    };

    console.log('Sending response:', JSON.stringify(responseData));
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: error.message });
  }
}
