// utils/extractYouTubeID.js

export const extractYouTubeID = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let videoId;

    if (urlObj.hostname === 'youtu.be') {
      // For shortened URLs like https://youtu.be/{videoId}
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      // For standard URLs like https://www.youtube.com/watch?v={videoId}
      videoId = urlObj.searchParams.get('v');
    }

    return videoId || null;
  } catch (error) {
    console.error('Invalid YouTube URL:', error);
    return null;
  }
};
