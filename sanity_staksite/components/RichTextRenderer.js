// components/RichTextRenderer.js

import React from 'react';
import { PortableText } from '@portabletext/react';

const RichTextRenderer = ({ content }) => {
  const components = {
    block: {
      normal: ({ children }) => <p className="px-4 mb-4">{children}</p>,
      h1: ({ children }) => <h1 className="text-4xl font-bold mb-6">{children}</h1>,
      h2: ({ children }) => <h2 className="text-3xl font-semibold mb-5">{children}</h2>,
      h3: ({ children }) => <h3 className="text-2xl font-medium mb-4">{children}</h3>,
      leftAlign: ({ children }) => <p className="text-left px-4 mb-4">{children}</p>,
      centerAlign: ({ children }) => <p className="text-center px-4 mb-4">{children}</p>,
      rightAlign: ({ children }) => <p className="text-right px-4 mb-4">{children}</p>,
    },
    marks: {
      strong: ({ children }) => <strong>{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
    },
  };

  return <PortableText value={content} components={components} />;
};

export default RichTextRenderer;
