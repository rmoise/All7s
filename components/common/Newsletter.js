import React from 'react';

export default function Newsletter({ newsletter }) {

  return (
    <section className="relative w-full z-10 overflow-hidden py-8" id="newsletter">
      <div className="relative w-full h-auto">
        {/* Adjusted padding for tablet and larger screens */}
        <div className="mx-auto max-w-7xl py-8 px-6 sm:px-8 md:px-12 lg:px-24 xl:px-16">
          {/* Flex container to organize the content */}
          <div className="lg:flex lg:items-start lg:justify-between">
            {/* Title and Description Section */}
            <div className="lg:w-1/2 lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-Headline tracking-tight text-white mb-4" id="newsletter-headline">
                {newsletter?.headline || 'GET MORE ALL7Z'}
              </h2>
              <p className="max-w-3xl text-md sm:text-lg lg:text-xl leading-snug text-gray-300 font-Headline">
                {newsletter?.description || 'SIGN UP TO HEAR MORE FROM US'}
              </p>
            </div>

            {/* Form Section */}
            <div className="mt-8 lg:mt-0 lg:w-auto lg:flex lg:items-center lg:ml-auto">
              <form name="newsletter" method="POST" className="w-full sm:w-full lg:w-auto lg:flex lg:items-center" data-netlify="true">
                <input type="hidden" name="form-name" value="newsletter" />
                <input
                  id="email-address"
                  name="email-address"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full lg:w-auto lg:flex-grow rounded-md border border-transparent px-4 py-2 sm:px-4 sm:py-3 placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  placeholder={newsletter?.placeholderText || 'Enter your email'}
                />
                <div className="mt-3 lg:mt-0 lg:ml-3">
                  <button
                    type="submit"
                    className="w-full lg:w-auto flex items-center justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 sm:px-4 sm:py-3 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 font-Headline"
                  >
                    {newsletter?.ctaText || 'Sign Up'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
