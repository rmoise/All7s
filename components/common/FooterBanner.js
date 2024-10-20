import React from 'react';

const FooterBanner = ({ footerBanner: { largeText1, largeText2 } }) => {
  return (
    <div className="flex justify-center mt-10">
      <div className="w-3/4 flex justify-center rounded-xl">
        <div className="banner-desc">
          <div className="font-Headline lg:text-7xl md:text-5xl sm:text-5xl">
            <h3 className="font-Headline tracking-tight">{largeText1}</h3>
            <h3 className="font-Headline tracking-tight">{largeText2}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterBanner;
