import React from 'react';
import { FooterSettings, FooterLink, SocialLink, SanityColor } from '../../types/sanity';

interface FooterProps {
  footer: FooterSettings;
}

const Footer: React.FC<FooterProps> = ({ footer }) => {
  console.log('Footer props:', footer);

  const alignment = footer.alignment || 'center';

  const {
    copyrightText,
    footerLinks = [],
    socialLinks = [],
    fontColor,
  } = footer;

  console.log('Processed footer data:', {
    copyrightText,
    footerLinks,
    socialLinks,
    fontColor,
    alignment
  });

  const footerStyle = {
    color: fontColor?.hex || '#FFFFFF',
    textAlign: alignment,
  } as React.CSSProperties;

  const justifyClass = alignment === 'left'
    ? 'justify-start'
    : alignment === 'right'
      ? 'justify-end'
      : 'justify-center';

  return (
    <footer className={`w-full bg-black py-4 relative z-20`} style={footerStyle}>
      <div className={`flex flex-col items-center sm:flex-row sm:space-x-4 px-4 space-y-4 sm:space-y-0 ${justifyClass}`}>
        {/* Copyright Section */}
        <h1 className={`text-xs sm:text-sm font-sans font-normal`}>
          {copyrightText}
        </h1>

        {/* Footer Links */}
        {footerLinks && footerLinks.length > 0 && (
          <div className={`flex space-x-4 ${justifyClass}`}>
            {footerLinks.map((link) => (
              <a
                key={link._key}
                href={link.url}
                className={`text-xs sm:text-sm font-sans font-normal hover:opacity-75 transition-opacity`}
              >
                {link.text}
              </a>
            ))}
          </div>
        )}

        {/* Social Links */}
        {socialLinks && socialLinks.length > 0 && (
          <div className={`flex space-x-4 ${justifyClass}`}>
            {socialLinks.map((link) => (
              <a
                key={link._key}
                href={link.url}
                className="h-4 w-4 sm:h-6 sm:w-6 hover:opacity-75 transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={link.iconUrl}
                  alt={link.platform}
                  className="h-full w-full"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
