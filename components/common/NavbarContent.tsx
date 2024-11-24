'use client';

import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AiOutlineShopping } from 'react-icons/ai';
import anime from 'animejs';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Cart from '../shop/Cart';
import { useStateContext } from '@context/StateContext';
import { useNavbar } from '@context/NavbarContext';
import { urlFor as urlForImage } from '@lib/sanity';
import { SanityImage, NavigationLink, NavbarData } from '@types';

// Utility functions moved to separate file
import { generateKey, classNames } from '@lib/utils';
import debounce from 'lodash/debounce';

const DEFAULT_LOGO = '/images/logo.png';

export const NavbarContent: React.FC<{ navbarData?: NavbarData }> = ({ navbarData: externalNavbarData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { navbarData: contextNavbarData, loading, blockTitles, refs } = useNavbar();
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [logoError, setLogoError] = useState(false);
  const [logoDimensions, setLogoDimensions] = useState({ width: 200, height: 80 });

  const finalNavbarData = externalNavbarData || contextNavbarData;

  // Hydration and mobile check
  useEffect(() => {
    setHydrated(true);
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile scroll animation
  useEffect(() => {
    if (isMobile) {
      let lastScrollTop = 0;

      const handleScroll = debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (Math.abs(scrollTop - lastScrollTop) > 10) {
          anime({
            targets: '#nav',
            translateY: scrollTop > lastScrollTop ? -80 : 15,
            duration: 300,
            easing: 'easeOutQuad'
          });
          lastScrollTop = scrollTop;
        }
      }, 100);

      window.addEventListener('scroll', handleScroll);
      return () => {
        lastScrollTop = 0;
        handleScroll.cancel();
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isMobile]);

  const handleShopNavigation = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push('/shop');
  }, [router]);

  const handleSmoothScroll = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();

    if (href.startsWith('/#')) {
      const sectionType = href.substring(2).toLowerCase();
      if (sectionType === 'look' && refs.lookRef?.current) {
        refs.lookRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState({}, '', `/#${blockTitles.look}`);
      } else if (sectionType === 'listen' && refs.listenRef?.current) {
        refs.listenRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState({}, '', `/#${blockTitles.listen}`);
      }
    } else {
      router.push(href);
    }
  }, [router, refs, blockTitles]);

  const renderNavLinks = useCallback((mobile = false) => {
    if (!finalNavbarData?.navigationLinks) return null;

    return finalNavbarData.navigationLinks.map((item: NavigationLink, index: number) => {
      const isShopLink = item.href.toLowerCase() === '/shop';

      if (isShopLink) {
        if (mobile) {
          return (
            <Disclosure.Button
              key={generateKey(item, index)}
              onClick={handleShopNavigation}
              className="w-full text-left bg-gray-500/50 text-white hover:bg-black hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            >
              {item.name}
            </Disclosure.Button>
          );
        }

        return (
          <button
            key={generateKey(item, index)}
            onClick={handleShopNavigation}
            className={classNames(
              'text-green-400',
              'px-2 py-2 rounded-md text-sm font-medium hover:text-green-400'
            )}
          >
            {item.name}
          </button>
        );
      }

      if (mobile) {
        return (
          <Disclosure.Button
            key={generateKey(item, index)}
            as="a"
            href={item.href}
            className="bg-gray-500/50 text-white hover:bg-black hover:text-white block px-3 py-2 rounded-md text-base font-medium"
            onClick={(e) => handleSmoothScroll(e, item.href)}
          >
            {item.name}
          </Disclosure.Button>
        );
      }

      return (
        <Link
          key={generateKey(item, index)}
          href={item.href}
          onClick={(e) => handleSmoothScroll(e, item.href)}
          className="text-white px-2 py-2 rounded-md text-sm font-medium hover:text-green-400"
        >
          {item.name}
        </Link>
      );
    });
  }, [finalNavbarData?.navigationLinks, handleShopNavigation, handleSmoothScroll]);

  if (loading || !finalNavbarData || !hydrated) {
    return (
      <nav className="fixed top-0 w-full h-16 bg-black z-50">
        <div className="mx-auto max-w-7xl px-4 h-full flex items-center justify-between">
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }

  // Logo URL handling
  const getLogo = (logo: string | SanityImage | undefined): string => {
    if (!logo) return DEFAULT_LOGO;
    if (typeof logo === 'string') return logo;
    return urlForImage(logo).url();
  };

  const logoUrl = !logoError ? getLogo(finalNavbarData.logo) : DEFAULT_LOGO;
  const navbarBgColor = finalNavbarData.isTransparent ? 'transparent' : finalNavbarData.backgroundColor?.hex || 'black';

  return (
    <Disclosure
      as="nav"
      id="nav"
      className={`
        fixed top-0 w-full h-auto px-8 z-50
        font-['roc-grotesk-wide']
        transition-all duration-200 ease-in-out
        bg-transparent text-white
      `}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-16">
            <div className="relative flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? <XMarkIcon className="block h-6 w-6" aria-hidden="true" /> : <Bars3Icon className="block h-6 w-6" aria-hidden="true" />}
                </Disclosure.Button>
              </div>

              {/* Logo */}
              <div className="flex-1 flex items-center justify-center sm:justify-start">
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/');
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && router.push('/')}
                >
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-auto max-h-16 sm:max-h-20"
                    style={{
                      height: 'auto',
                      maxWidth: '200px',
                      objectFit: 'contain'
                    }}
                    onError={() => {
                      setLogoError(true);
                    }}
                    onLoad={(e) => {
                      const img = e.target as HTMLImageElement;
                      setLogoDimensions({
                        width: img.naturalWidth,
                        height: img.naturalHeight
                      });
                    }}
                  />
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <div className="flex space-x-8">
                  {renderNavLinks()}
                </div>

                {/* Shopping Cart Icon */}
                <div className="relative">
                  <button type="button" className="cart-icon relative flex items-center" onClick={() => setShowCart(true)}>
                    <AiOutlineShopping className="text-2xl text-white" />
                    <span
                      className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                        ${totalQuantities > 9 ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'}
                        flex items-center justify-center font-medium transition-all duration-200`}
                      style={{ opacity: totalQuantities > 0 ? 1 : 0 }}
                    >
                      {totalQuantities}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Shopping Cart */}
              <div className="flex sm:hidden items-center absolute right-0 inset-y-0 space-x-4">
                <button type="button" className="cart-icon relative flex items-center" onClick={() => setShowCart(true)}>
                  <AiOutlineShopping className="text-2xl text-white" />
                  <span
                    className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                      ${totalQuantities > 9 ? 'w-5 h-5 text-xs' : 'w-4 h-4 text-xs'}
                      flex items-center justify-center font-medium transition-all duration-200`}
                    style={{ opacity: totalQuantities > 0 ? 1 : 0 }}
                  >
                    {totalQuantities}
                  </span>
                </button>
              </div>

              {showCart && <Cart />}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {renderNavLinks(true)}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};