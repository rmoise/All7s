import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    SANITY_PREVIEW_SECRET: process.env.SANITY_PREVIEW_SECRET,
  });
}
