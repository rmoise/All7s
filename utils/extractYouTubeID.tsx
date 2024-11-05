/**
 * Extracts YouTube video ID from various YouTube URL formats
 * @param url - The YouTube URL to extract ID from
 * @returns The video ID or null if not found
 */
export const extractYouTubeID = (url: string): string | null => {
  if (!url) return null;

  try {
    // Convert to string if needed and clean up
    const urlString = typeof url === 'string' ? url.trim() : String(url);
    
    // Common YouTube URL patterns
    const patterns = [
      // youtu.be URLs
      /youtu\.be\/([^\/\?&]+)/,
      // youtube.com/watch URLs
      /youtube\.com\/watch\?v=([^\/\?&]+)/,
      // youtube.com/embed URLs
      /youtube\.com\/embed\/([^\/\?&]+)/,
      // youtube.com/v URLs
      /youtube\.com\/v\/([^\/\?&]+)/,
      // youtube.com/shorts URLs
      /youtube\.com\/shorts\/([^\/\?&]+)/
    ];

    // Try each pattern until we find a match
    for (const pattern of patterns) {
      const match = urlString.match(pattern);
      if (match && match[1]) {
        // Validate ID length (most YouTube IDs are 11 characters)
        const id = match[1];
        if (id.length >= 10 && id.length <= 12) {
          return id;
        }
      }
    }

    // If no patterns match, try to extract from query parameters
    try {
      const urlObj = new URL(urlString);
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length >= 10 && videoId.length <= 12) {
        return videoId;
      }
    } catch (e) {
      console.warn('Failed to parse URL:', e);
    }

    console.warn('Could not extract YouTube ID from URL:', url);
    return null;
  } catch (error) {
    console.error('Error extracting YouTube ID:', error);
    return null;
  }
};

/**
 * Validates if a string is a valid YouTube video ID
 * @param id - The ID to validate
 * @returns boolean indicating if ID is valid
 */
export const isValidYouTubeID = (id: string): boolean => {
  if (!id) return false;
  // YouTube IDs are typically 11 characters, but can be 10-12
  return /^[a-zA-Z0-9_-]{10,12}$/.test(id);
};
