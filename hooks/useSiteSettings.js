// hooks/useSiteSettings.js
import { useState, useEffect } from 'react';
import { createClient } from '@sanity/client';

// Create a Sanity client instance
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2022-10-29',
  useCdn: process.env.NODE_ENV === 'production', // Use CDN for production to increase speed
});

// The query to fetch site settings
const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  title,
  favicon{
    asset->{
      url,
      _updatedAt
    }
  },
  seo{
    metaTitle,
    metaDescription,
    openGraphImage{
      asset->{
        url
      }
    }
  }
}`;

const useSiteSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .fetch(siteSettingsQuery)
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching site settings:", err);
        setError(err);
        setLoading(false);
      });
  }, []);

  return { settings, loading, error };
};

export default useSiteSettings;
