// components/layout/Layout.tsx
import React from 'react';
import Head from 'next/head';
import Navbar from '@components/common/Navbar';
import Footer from '@components/common/Footer';
import { motion } from 'framer-motion';
import type { SiteSettings } from '@/types';

interface LayoutProps {
  children: React.ReactNode;
  settings?: SiteSettings;
}

const Layout: React.FC<LayoutProps> = ({ children, settings }) => {
  return (
    <>
      <Head>
        <title>{settings?.title || 'Default Title'}</title>
      </Head>

      <div className="flex flex-col min-h-screen">
        {/* Navbar - Always render, optionally pass data */}
        <Navbar navbarData={settings?.navbar} />

        {/* Main Content */}
        <motion.main
          className="flex-grow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>

        {/* Footer */}
        {settings?.footer && (
          <Footer footer={settings.footer} />
        )}
      </div>
    </>
  );
};

export default Layout;
