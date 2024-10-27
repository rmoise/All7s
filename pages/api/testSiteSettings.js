import { client } from '../../lib/client';

export default async function handler(req, res) {
  const query = `*[_type == "settings"][0]{
    title,
    seo {
      metaTitle,
      metaDescription
    },
    navbar {
      logo,
      navigationLinks[] {
        name,
        href
      },
      backgroundColor,
      isTransparent
    },
    footer {
      copyrightText,
      footerLinks,
      socialLinks,
      fontColor,
      alignment
    },
    favicon {
      asset-> {
        url
      }
    }
  }`;

  try {
    const data = await client.fetch(query);
    if (!data) {
      throw new Error("No data returned from Sanity");
    }
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching site settings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
