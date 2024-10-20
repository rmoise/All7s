import React, { useCallback, useState } from 'react';
import { TextInput, Stack, Text, Card } from '@sanity/ui';
import { set, unset } from 'sanity';
import { StringInputProps } from 'sanity';

interface SpotifyMetadata {
  title: string;
  artist: string;
  imageUrl: string;
  embedUrl: string;
  releaseType: string;
}

const API_URL = process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging'
  ? 'https://staging--all7z.netlify.app/.netlify/functions/spotify-metadata'
  : 'https://all7z.com/.netlify/functions/spotify-metadata';

const EmbedUrlInput = (props: StringInputProps) => {
  const { onChange, value = '' } = props;
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<SpotifyMetadata | null>(null);

  const extractSpotifyUrl = (input: string): string => {
    const urlMatch = input.match(/src="(https:\/\/open\.spotify\.com\/embed\/album\/[^"]+)"/);
    return urlMatch ? urlMatch[1] : input;
  };

  const fetchMetadata = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const spotifyUrl = extractSpotifyUrl(url);
      console.log('Fetching metadata for URL:', spotifyUrl);

      const response = await fetch(`${API_URL}?url=${encodeURIComponent(spotifyUrl)}`);
      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error response:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: SpotifyMetadata = await response.json();
      console.log('Received metadata:', JSON.stringify(data, null, 2));

      if (!data.title || !data.artist) {
        console.error('Incomplete metadata received:', data);
        throw new Error('Incomplete metadata received from API');
      }

      setMetadata(data);
      onChange(set(data.embedUrl));
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setMetadata(null);
    } finally {
      setIsLoading(false);
    }
  }, [onChange]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (newValue && newValue !== value) {
      fetchMetadata(newValue);
    } else if (!newValue) {
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
            <Text weight="semibold">Title: {metadata.title}</Text>
            <Text>Artist: {metadata.artist}</Text>
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
