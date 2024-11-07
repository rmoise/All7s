// api/testSanity.js
import { getClient } from '../../lib/client';

export default async function handler(req, res) {
  const client = getClient();
  try {
    const data = await client.fetch('*[_type == "settings"][0]');
    res.status(200).json({ data });
  } catch (error) {
    console.error("Sanity Fetch Error:", error);  // Log error for debugging
    res.status(500).json({ error: "Failed to fetch data from Sanity" });
  }
}
