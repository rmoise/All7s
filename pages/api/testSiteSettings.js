// /pages/api/testSiteSettings.js
import { client } from '../../lib/client';

export default async function handler(req, res) {
  const query = `*[_type == "settings"][0]`;

  try {
    const result = await client.fetch(query);

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: "Settings document not found" });
    }
  } catch (error) {
    console.error("Error fetching site settings:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
