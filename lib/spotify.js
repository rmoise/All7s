export async function getSpotifyAccessToken() {
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
