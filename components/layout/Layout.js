import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const Layout = ({ children, siteSettings }) => {
  useEffect(() => {
    const updateVH = () => {
      // Check if window is defined to avoid SSR issues
      if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      }
    };

    updateVH(); // Initial update on load
    window.addEventListener('resize', updateVH);

    return () => window.removeEventListener('resize', updateVH);
  }, []);

  return (
    <>
      <Head>
        <title>{siteSettings?.title || 'ALL7Z'}</title>
      </Head>

      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Header */}
        <header className="w-full">
          <Navbar navbarData={siteSettings?.navbar} />
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full relative z-20" style={{ padding: 0, margin: 0, boxSizing: 'border-box' }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full mt-auto">
          <Footer footerData={siteSettings?.footer} />
        </footer>
      </div>
    </>
  );
};

export default Layout;
