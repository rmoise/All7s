import React, { useState, useCallback } from 'react';
import { TextInput } from '@sanity/ui';
import { StringInputProps, set, unset } from 'sanity';

// Create a custom type that combines StringInputProps and the expected component props
type EmbedUrlInputProps = StringInputProps & {
  schemaType: { name: string; title?: string; description?: string };
  onSetFieldValue: (field: string, value: string | null) => void;
};

interface SpotifyMetadata {
  title: string;
  artist: string;
}

const EmbedUrlInput = (props: EmbedUrlInputProps) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (value === '') {
        props.onChange(unset());
      } else {
        props.onChange(set(value));
      }

      if (value) {
        const apiUrl = `/.netlify/functions/spotify-metadata?url=${encodeURIComponent(value)}`;
        console.log('Fetching from:', apiUrl);
        try {
          const response = await fetch(apiUrl);
          const text = await response.text();
          console.log('Raw response:', text);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          }

          let data: SpotifyMetadata;
          try {
            data = JSON.parse(text);
          } catch (parseError) {
            console.error('Error parsing JSON:', text);
            throw new Error('Invalid JSON response');
          }

          // Update Spotify fields
          props.onChange(set(value));
          props.onSetFieldValue('spotifyTitle', data.title);
          props.onSetFieldValue('spotifyArtist', data.artist);

          console.log('Metadata:', data);
          setError(null); // Clear any previous errors
        } catch (err) {
          console.error('Error fetching metadata:', err);
          setError(`Failed to fetch metadata: ${err instanceof Error ? err.message : 'Unknown error'}. Please check the URL and try again.`);
        }
      }
    },
    [props]
  );

  return (
    <div>
      <TextInput
        value={props.value || ''}
        onChange={handleChange}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default EmbedUrlInput;
