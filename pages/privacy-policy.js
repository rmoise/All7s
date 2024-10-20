import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        This website uses third-party services including YouTube, Spotify, and SoundCloud.
        These services may use cookies and collect data about your interactions with our site.
      </p>
      <h2 className="text-2xl font-bold mb-2">YouTube</h2>
      <p className="mb-4">
        We use YouTube to embed videos. YouTube may set cookies on your browser when you interact
        with the YouTube video player. Read more about YouTube's privacy policy.
      </p>
      <h2 className="text-2xl font-bold mb-2">Spotify</h2>
      <p className="mb-4">
        We use Spotify to embed music players. Spotify may set cookies on your browser when you
        interact with the Spotify player. Read more about Spotify's privacy policy.
      </p>
      <h2 className="text-2xl font-bold mb-2">SoundCloud</h2>
      <p className="mb-4">
        We use SoundCloud to embed audio players. SoundCloud may set cookies on your browser when you
        interact with the SoundCloud player. Read more about SoundCloud's privacy policy.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
