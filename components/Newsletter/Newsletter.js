/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
export default function Newsletter() {
    return (
      <div className="bg-black h-max mb-28">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:py-16 lg:px-8">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-bold font-Headline tracking-tight text-white sm:text-4xl" id="newsletter-headline">
             GET MORE ALL7Z
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-gray-300 font-Headline">
              SIGN UP TO HEAR MORE FROM US
            </p>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <form name="newsletter" method="POST" className="sm:flex" netlify>
              <input type="hidden" name="form-name" value="newsletter"/>
              {/* <label htmlFor="email-address" className="">
                Email address
              </label> */}
              <input
                id="email-address"
                name="email-address"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-transparent px-5 py-3 placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 sm:max-w-xs"
                placeholder="Enter your email"
              />
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-gray-700 px-5 py-3 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 font-Headline"
                >
                  Sign Up
                </button>
              </div>
            </form>
            {/* <p className="mt-3 text-sm text-gray-300">
              We care about the protection of your data. Read our{' '}
              <a href="#" className="font-medium text-white underline">
                Privacy Policy.
              </a>
            </p> */}
          </div>
        </div>
      </div>
    )
  }
  