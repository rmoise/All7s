import React from 'react';
import { urlFor } from '../../lib/client';

export default function Album({ content }) {
  return (
    <div className='flex flex-col items-center justify-center'>
      <p className="bg-black/50 rounded-lg text-2xl font-bold w-1/2 mb-3 bg-gradient-to-r from-blue-300/50 via-pink-600/50 to-purple-600/50">
        {content?.title || 'No title'} - {content?.description || 'No description'}
      </p>
      <img
        className="mb-8 w-1/2 h-auto"
        src={urlFor(content?.image)?.url() || '/images/placeholder.png'}
        alt={content?.title || 'Album image'}
      />
    </div>
  );
}
