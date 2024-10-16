import React from 'react';

const Footer = ({ footerData }) => {
  const { copyrightText, footerLinks, socialLinks, fontColor, alignment } = footerData || {};

  // Log footerData and alignment to debug
  console.log('Footer Data:', footerData);
  console.log('Alignment:', alignment);

  // Set text alignment dynamically
  const footerStyle = {
    color: fontColor?.hex || '#FFFFFF',
    textAlign: alignment || 'center',
  };

  // Set flex alignment classes based on alignment prop
  let justifyClass = 'justify-center'; // default
  if (alignment === 'left') {
    justifyClass = 'justify-start';
  } else if (alignment === 'right') {
    justifyClass = 'justify-end';
  }

  // Log alignmentClass to verify which class is being applied
  console.log('Justify Class:', justifyClass);

  return (
    <footer className={`w-full bg-black py-4 relative z-20`} style={footerStyle}>
      <div className={`flex flex-col items-center sm:flex-row sm:space-x-4 px-4 space-y-4 sm:space-y-0 ${justifyClass}`}>
        {/* Copyright Section */}
        <h1
          className={`text-xs sm:text-sm font-sans font-normal`}
          style={{ color: footerStyle.color }}
        >
          {copyrightText || 'ALL RIGHTS RESERVED | ALL7Z | 2022'}
        </h1>

        {/* Footer Links */}
        {footerLinks && footerLinks.length > 0 && (
          <div className={`flex space-x-4 ${justifyClass}`}>
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                className={`text-xs sm:text-sm font-sans font-normal`}
                style={{ color: footerStyle.color }}
              >
                {link.text}
              </a>
            ))}
          </div>
        )}

        {/* Social Links */}
        {socialLinks && socialLinks.length > 0 && (
          <div className={`flex space-x-4 ${justifyClass}`}>
            {socialLinks.map((link, index) => (
              <a key={index} href={link.url} className="h-4 w-4 sm:h-6 sm:w-6">
                <img src={link.iconUrl} alt={link.platform} className="h-full w-full" />
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
