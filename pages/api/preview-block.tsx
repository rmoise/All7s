import { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import { renderToString } from 'react-dom/server';
import dynamic from 'next/dynamic';
import { client } from '../../lib/client';

// Import your existing HeroBanner component
const HeroBanner = dynamic(() => import('../../components/home/HeroBanner'), {
  ssr: true
});

// Match your schema structure
interface HeroBannerData {
  backgroundImage?: {
    asset: {
      _ref: string;
    };
  };
  smallText?: string;
  midText?: string;
  largeText1?: string;
  ctaText?: string;
  ctaLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  openGraphImage?: {
    asset: {
      _ref: string;
    };
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, id } = req.query;

  if (!type || !id) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // Fetch the block data from Sanity
  const blockData = await client.fetch<HeroBannerData>(`
    *[_type == $type && _id == $id][0]
  `, { type, id });

  if (!blockData) {
    return res.status(404).json({ error: 'Block not found' });
  }

  // Wrap the data to match your component's props
  const componentProps = {
    heroBanner: blockData
  };

  // Return HTML that renders the preview
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview - ${blockData.metaTitle || 'Content Block'}</title>
        <link rel="stylesheet" href="/css/styles.css">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="preview">
          ${type === 'heroBanner' ? await renderToString(<HeroBanner {...componentProps} />) : ''}
        </div>
      </body>
    </html>
  `);
}