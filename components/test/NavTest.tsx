import React, { useEffect, useRef } from 'react';
import { useNavbar } from '@/context/NavbarContext';

export const NavTest = () => {
  const { blockTitles, updateBlockTitle, navbarData, refs } = useNavbar();
  const { lookRef, listenRef } = refs;

  // Debug logging
  useEffect(() => {
    console.log('Current blockTitles:', blockTitles);
    console.log('Current navData:', navbarData);
  }, [blockTitles, navbarData]);

  const handleScroll = (type: 'look' | 'listen') => {
    try {
      const ref = type === 'look' ? lookRef : listenRef;
      if (!ref.current) {
        console.warn(`${type} section ref not found`);
        return;
      }
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      console.error(`Error scrolling to ${type} section:`, error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Test Navigation */}
      <div className="fixed top-20 left-4 bg-white p-4 rounded shadow-lg z-50">
        <button
          onClick={() => handleScroll('look')}
          className="block mb-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Scroll to LOOK
        </button>
        <button
          onClick={() => handleScroll('listen')}
          className="block px-4 py-2 bg-blue-500 text-white rounded"
        >
          Scroll to LISTEN
        </button>
      </div>

      {/* Test Content */}
      <div className="space-y-[100vh]">
        <div
          ref={lookRef}
          id="look-section"
          className="h-screen flex items-center justify-center bg-gray-100"
        >
          <div className="text-center">
            <h2 className="text-4xl mb-4">{blockTitles.look}</h2>
            <input
              type="text"
              value={blockTitles.look}
              onChange={(e) => updateBlockTitle('look', e.target.value)}
              className="border p-2 text-black"
            />
          </div>
        </div>

        <div
          ref={listenRef}
          id="listen-section"
          className="h-screen flex items-center justify-center bg-gray-200"
        >
          <div className="text-center">
            <h2 className="text-4xl mb-4">{blockTitles.listen}</h2>
            <input
              type="text"
              value={blockTitles.listen}
              onChange={(e) => updateBlockTitle('listen', e.target.value)}
              className="border p-2 text-black"
            />
          </div>
        </div>
      </div>
    </div>
  );
};