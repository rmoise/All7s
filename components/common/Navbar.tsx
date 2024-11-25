'use client';

import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { NavbarContent } from './NavbarContent';
import { NavbarData } from '@types';
import { useEffect, useRef } from 'react';

const NAVBAR_HEIGHT = 64;
const SCROLL_THRESHOLD = 50;

const navbarStyles = `
  .navbar-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: ${NAVBAR_HEIGHT}px;
    z-index: 150;
    background-color: black;
    transform: translateY(var(--navbar-translate, 0));
    transition: transform 200ms ease-out;
  }

  .navbar-content {
    height: 100%;
  }

  .navbar-container.nav-hidden {
    transform: translateY(-${NAVBAR_HEIGHT}px);
  }

  .navbar-logo {
    transition: transform 150ms ease-out;
  }
`;

const Navbar: React.FC<{ navbarData?: NavbarData }> = ({ navbarData: externalNavbarData }) => {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = navbarStyles;
    document.head.appendChild(styleSheet);

    const handleScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const currentScrollY = Math.max(0, window.scrollY);
          const navbar = document.querySelector('.navbar-container');

          if (navbar) {
            // Show navbar if at top or scrolling up significantly
            if (currentScrollY <= 0 || currentScrollY < lastScrollY.current - SCROLL_THRESHOLD) {
              navbar.classList.remove('nav-hidden');
            }
            // Hide navbar if scrolling down significantly and not at top
            else if (currentScrollY > lastScrollY.current + SCROLL_THRESHOLD && currentScrollY > NAVBAR_HEIGHT) {
              navbar.classList.add('nav-hidden');
            }
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      styleSheet.remove();
    };
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="navbar-container">
          <div className="navbar-content">
            <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
              <div className="text-white text-xl font-bold">All7Z</div>
            </div>
          </div>
        </div>
      }
    >
      <NavbarContent navbarData={externalNavbarData} />
    </ErrorBoundary>
  );
};

export default Navbar;