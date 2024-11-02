import sanityClient from 'part:@sanity/base/client'

const client = sanityClient.withConfig({ apiVersion: '2021-03-25' })

export async function updateSpotifyMetadata(documentId, spotifyData) {
  try {
    await client
      .patch(documentId)
      .set({
        spotifyTitle: spotifyData.title,
        spotifyArtist: spotifyData.artist,
      })
      .commit()
    console.log('Spotify metadata updated successfully')
  } catch (error) {
    console.error('Error updating Spotify metadata:', error)
  }
}

