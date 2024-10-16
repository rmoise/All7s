import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const Layout = ({ children, footerData, navbarData }) => {
  useEffect(() => {
    const updateVH = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    updateVH(); // Initial update on load
    window.addEventListener('resize', updateVH);

    return () => {
      window.removeEventListener('resize', updateVH);
    };
  }, []);

  useEffect(() => {
    const mainElement = document.querySelector('main');
    const footerElement = document.querySelector('footer');
    const bodyElement = document.querySelector('body');

    if (mainElement && footerElement && bodyElement) {
      console.log(`Main element height: ${mainElement.offsetHeight}`);
      console.log(`Footer element height: ${footerElement.offsetHeight}`);
      console.log(`Body element height: ${bodyElement.offsetHeight}`);

      const childrenElements = mainElement.children;
      Array.from(childrenElements).forEach((child, index) => {
        console.log(`Child ${index} height: ${child.offsetHeight}`);
      });
    }
  }, [children]);

  return (
    <>
      <Head>
        <title>ALL7Z</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Layout container */}
      <div className="flex flex-col min-h-screen bg-black text-white">
        {/* Header */}
        <header className="w-full">
          <Navbar navbarData={navbarData} />
        </header>

        {/* Main Content */}
        <main className="flex-grow w-full relative z-20" style={{ padding: '0', margin: '0', boxSizing: 'border-box' }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full mt-auto">
          <Footer footerData={footerData} />
        </footer>
      </div>
    </>
  );
};

export default Layout;
