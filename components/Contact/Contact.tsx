import React from 'react';
import type { ContactPageData } from '@/types';

interface ContactProps extends Omit<ContactPageData, 'seo'> {
  info: Array<{
    name: string;
    city: string;
    state: string;
    comment: string;
  }>;
  message?: string;
}

export default function Contact({
  title,
  description,
  address,
  phoneNumber,
  email,
  message,
  socialLinks,
  info = []
}: ContactProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-white">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {description && <p className="mb-8">{description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {address && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Address</h2>
                <p>{address}</p>
              </div>
            )}

            {phoneNumber && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Phone</h2>
                <p>{phoneNumber}</p>
              </div>
            )}

            {email && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Email</h2>
                <p>{email}</p>
              </div>
            )}

            {socialLinks && socialLinks.length > 0 && (
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Social Media</h2>
                <div className="flex space-x-4">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-gray-300"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {message && <p className="mb-4">{message}</p>}
            {/* Add your contact form here */}
          </div>
        </div>
      </div>
    </div>
  );
}
