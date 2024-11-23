'use client';

import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { NavbarContent } from './NavbarContent';
import { NavbarData } from '@types'

const Navbar: React.FC<{ navbarData?: NavbarData }> = ({ navbarData: externalNavbarData }) => {
  return (
    <ErrorBoundary
      fallback={
        <nav className="fixed top-0 w-full h-16 bg-black z-50">
          <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
            <div className="text-white">All7Z</div>
          </div>
        </nav>
      }
    >
      <NavbarContent navbarData={externalNavbarData} />
    </ErrorBoundary>
  );
};

export default Navbar;