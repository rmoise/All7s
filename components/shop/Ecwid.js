import ProductBrowser from '@ecwid/nextjs-ecwid-plugin'
import { useEffect } from 'react'
/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/

  export default function Ecwid() {
     return (
      <div className="absolute">
      <div className="flex justify-center mt-12 mb-12">
        <h1 className="font-Headline text-7xl drop-shadow-xl mb-1">SHOP ALL7z</h1>
      </div>
      <ProductBrowser
      storeId="81732001"
      />
      </div>
     )  
    
  }

  