import React, { useCallback } from 'react';
import { StringInputProps, PatchEvent, set, unset } from 'sanity';

interface EmbedUrlInputProps extends StringInputProps {
  onSetFieldValue?: (field: string, value: string | null) => void;
}

const EmbedUrlInput: React.FC<EmbedUrlInputProps> = (props) => {
  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value.trim();
      console.log('Input value:', value);

      if (value === '') {
        props.onChange(PatchEvent.from(unset()));
        return;
      }

      // Extract the Spotify album URL from the iframe src attribute
      const srcMatch = value.match(/src="([^"]+)"/);
      if (!srcMatch) {
        console.error('Invalid iframe format');
        return;
      }
      const spotifyUrl = srcMatch[1]; // Extract the URL directly
      console.log('Extracted Spotify URL:', spotifyUrl);

      // Determine the correct function URL based on the environment
      const isProduction = window.location.hostname === 'all7z.com';
      const functionUrl = isProduction
        ? 'https://all7z.com/api/spotify-metadata'
        : 'https://staging--all7z.netlify.app/api/spotify-metadata';

      console.log('Function URL:', functionUrl);

      try {
        const response = await fetch(`${functionUrl}?url=${encodeURIComponent(spotifyUrl)}`);
        console.log('Fetch response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const rawText = await response.text();
        console.log('Raw response:', rawText);

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          throw new Error('Invalid JSON response');
        }

        console.log('Metadata:', data);

        props.onChange(PatchEvent.from(set(value)));
        if (props.onSetFieldValue) {
          props.onSetFieldValue('spotifyTitle', data.title);
          props.onSetFieldValue('spotifyArtist', data.artist);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
        // Handle error (e.g., show an error message to the user)
      }
    },
    [props]
  );

  return (
    <div>
      <input
        type="text"
        value={props.value || ''}
        onChange={handleChange}
        placeholder="Enter Spotify embed URL"
      />
    </div>
  );
};

export default EmbedUrlInput;
