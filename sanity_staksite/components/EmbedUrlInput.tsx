import React, { useCallback, useState, useEffect } from 'react';
import { TextInput, Stack, Text, Card } from '@sanity/ui';
import { set, unset, useFormValue, useClient } from 'sanity';
import { StringInputProps } from 'sanity';

interface SpotifyMetadata {
  title: string;
  artist: string;
  imageUrl: string;
  embedUrl: string;
  releaseType: string;
}

const API_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8888/.netlify/functions/spotify-metadata'
  : '/.netlify/functions/spotify-metadata';

const EmbedUrlInput = (props: StringInputProps) => {
  const { onChange, value = '' } = props;
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SpotifyMetadata | null>(null);

  // Get the document ID using useFormValue
  const documentId = useFormValue(['_id']) as string;

  // Use Sanity client for patching
  const client = useClient();

  useEffect(() => {
    if (value && !metadata) {
      fetchMetadata(value);
    }
  }, [value]);

  const extractSpotifyUrl = (input: string): string => {
    console.log('Extracting Spotify URL from:', input);
    const urlMatch = input.match(/https:\/\/open\.spotify\.com\/(?:embed\/)?album\/([a-zA-Z0-9]+)/);
    const result = urlMatch ? `https://open.spotify.com/album/${urlMatch[1]}` : input;
    console.log('Extracted URL:', result);
    return result;
  };

  const fetchMetadata = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const spotifyUrl = extractSpotifyUrl(url);
      console.log('Fetching metadata for URL:', spotifyUrl);

      const encodedUrl = encodeURIComponent(spotifyUrl);
      const apiUrl = `${API_URL}?url=${encodedUrl}`;
      console.log('Full API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);

      setMetadata(data);
      onChange(set(data.embedUrl));

      // Update Sanity document with Spotify metadata
      await client
        .patch(documentId)
        .set({
          spotifyTitle: data.title,
          spotifyArtist: data.artist,
          releaseType: data.releaseType,
        })
        .commit();

    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [onChange, client, documentId]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log('Input value changed to:', newValue);
    setInputValue(newValue);
    if (newValue && newValue !== value) {
      console.log('Triggering fetchMetadata');
      fetchMetadata(newValue);
    } else if (!newValue) {
      console.log('Clearing metadata');
      onChange(unset());
      setMetadata(null);
    }
  }, [value, onChange, fetchMetadata]);

  return (
    <Stack space={3}>
      <TextInput
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder="Enter Spotify embed URL or paste iframe"
      />
      {isLoading && <Text>Loading metadata...</Text>}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      {metadata && (
        <Card padding={3} radius={2} shadow={1}>
          <Stack space={2}>
            <Text weight="semibold">Fetched Title: {metadata.title}</Text>
            <Text>Fetched Artist: {metadata.artist}</Text>
            <Text>Release Type: {metadata.releaseType}</Text>
            {metadata.imageUrl && (
              <img src={metadata.imageUrl} alt={metadata.title} style={{ maxWidth: '100%', height: 'auto' }} />
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default EmbedUrlInput;
