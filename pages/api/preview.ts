import type { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@lib/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable Preview Mode
  res.setPreviewData({});

  // Always redirect to homepage with preview mode enabled
  const destination = req.query.id
    ? `/?preview=true&id=${req.query.id}`
    : '/?preview=true';

  res.writeHead(307, { Location: destination });
  res.end();
}
