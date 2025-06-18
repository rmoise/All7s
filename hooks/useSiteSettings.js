// hooks/useSiteSettings.js
import { useState, useEffect } from 'react';
import { client } from '../lib/client'; // Ensure you're using the centralized client

const siteSettingsQuery = `*[_type == "settings"][0]{
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
    console.log("Fetching site settings...");
    client
      .fetch(siteSettingsQuery)
      .then((data) => {
        console.log("Fetched site settings data:", data);
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
