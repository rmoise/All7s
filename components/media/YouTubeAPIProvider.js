import React, { createContext, useContext, useEffect, useState } from 'react';

const YouTubeAPIContext = createContext();

export const useYouTubeAPI = () => useContext(YouTubeAPIContext);

export const YouTubeAPIProvider = ({ children }) => {
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        console.log("YouTube API is ready.");
        setApiReady(true);
      };
    } else {
      setApiReady(true);
    }
  }, []);

  return (
    <YouTubeAPIContext.Provider value={apiReady}>
      {children}
    </YouTubeAPIContext.Provider>
  );
};
