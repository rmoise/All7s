import { client } from '../../lib/client';

export default async function handler(req, res) {
  const siteSettingsQuery = `*[_type == "settings"][0]{
    title,
    seo { metaTitle, metaDescription, openGraphImage { asset-> { url } } }
  }`;
  try {
    const siteSettings = await client.fetch(siteSettingsQuery);
    console.log("Fetched Site Settings in Production:", siteSettings);
    res.status(200).json({ siteSettings });
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ error: error.message });
  }
}
