// components/layout/Layout.tsx
import React, { useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import { SanityLive } from '@lib/live';
import type { NavbarData } from '@components/common/Navbar';

interface SiteSettings {
  title?: string;
  navbar?: NavbarData;
  footer?: any;  // Replace with proper footer type when available
}

interface LayoutProps {
  children: React.ReactNode;
  siteSettings?: SiteSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, siteSettings }) => {
  useEffect(() => {
    const updateVH = () => {
      if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      }
    };

    updateVH();
    window.addEventListener('resize', updateVH);
    return () => window.removeEventListener('resize', updateVH);
  }, []);

  const content = (
    <>
      <Head>
        <title>{siteSettings?.title || 'ALL7Z'}</title>
      </Head>

      <div className="flex flex-col min-h-screen bg-black text-white">
        <header className="w-full">
          <Navbar navbarData={siteSettings?.navbar} />
        </header>

        <main className="flex-grow w-full relative z-20" style={{ padding: 0, margin: 0, boxSizing: 'border-box' }}>
          {children}
        </main>

        <footer className="w-full mt-auto">
          <Footer footerData={siteSettings?.footer} />
        </footer>
      </div>
    </>
  )

  return <SanityLive>{content}</SanityLive>
};

export default Layout;
