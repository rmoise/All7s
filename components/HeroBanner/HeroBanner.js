import React from 'react';

const HeroBanner = ({ heroBanner }) => {
  return (
    <div className="mt-28">
      <div className="flex flex-col items-center ">
        <p className="beats-solo font-Headline ml-0">{heroBanner?.smallText}</p>
        <h3 className="font-Headline md:text-5xl sm:text-2xl">{heroBanner?.midText}</h3> {/* Fixed closing tag */}
        <h1 className="font-Headline md:text-8xl sm:text-5xl">{heroBanner?.largeText1}</h1>
      </div>
    </div>
  );
};

export default HeroBanner;
