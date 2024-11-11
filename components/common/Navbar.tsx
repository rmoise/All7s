import { Fragment, useState, useEffect, useCallback, useRef } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AiOutlineShopping } from 'react-icons/ai';
import anime from 'animejs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cart from '../shop/Cart';
import { useStateContext } from '../../context/StateContext';
import { useNavbar } from '../../context/NavbarContext';
import { urlFor as urlForImage } from '../../lib/client';
import { SanityImage, NavigationLink, NavbarData } from '../../types/sanity';

// Utility functions
const generateKey = (item: NavigationLink, index: number): string => {
  return `nav-${item.name}-${index}-${item.href}`;
};

const classNames = (...classes: string[]): string =>
  classes.filter(Boolean).join(' ');

const DEFAULT_LOGO = '/images/logo.png';

const Navbar: React.FC<{ navbarData?: NavbarData }> = ({ navbarData: externalNavbarData }) => {
  const router = useRouter();
  const { navbarData: contextNavbarData, loading, blockTitles, refs } = useNavbar();
  const { lookRef, listenRef } = refs;
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [logoError, setLogoError] = useState(false);
  const [logoDimensions, setLogoDimensions] = useState({ width: 200, height: 80 }); // Default dimensions

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
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        anime({
          targets: '#nav',
          translateY: scrollTop > lastScrollTop ? -80 : 15,
        });
        lastScrollTop = scrollTop;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);

  // Updated smooth scroll handler
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

  // Move renderNavLinks before any conditional returns
  const renderNavLinks = useCallback((mobile = false) => {
    if (!finalNavbarData?.navigationLinks) return null;

    return finalNavbarData.navigationLinks.map((item: NavigationLink, index: number) => {
      const key = generateKey(item, index);
      const isLookLink = item.href?.toLowerCase().includes('look') || item.href?.toLowerCase().includes('/#look');
      const isListenLink = item.href?.toLowerCase().includes('listen') || item.href?.toLowerCase().includes('/#listen');

      // Always update section links when blockTitles change
      let linkText = item.name;
      if (isLookLink && blockTitles?.look) {
        linkText = blockTitles.look;
      } else if (isListenLink && blockTitles?.listen) {
        linkText = blockTitles.listen;
      }

      const linkProps = {
        href: item.href,
        className: classNames(
          item.name === 'BUY' ? 'text-green-400' : 'text-white',
          'px-2 py-2 rounded-md text-sm font-medium hover:text-green-400'
        ),
        onClick: (e: React.MouseEvent) => handleSmoothScroll(e, item.href)
      };

      if (mobile) {
        return (
          <Disclosure.Button
            key={key}
            as="a"
            {...linkProps}
            className={classNames(
              'bg-gray-500/50 text-white hover:bg-black hover:text-white',
              'block px-3 py-2 rounded-md text-base font-medium'
            )}
          >
            {linkText}
          </Disclosure.Button>
        );
      }

      return <Link key={key} {...linkProps}>{linkText}</Link>;
    });
  }, [finalNavbarData?.navigationLinks, blockTitles, handleSmoothScroll]);

  if (loading || !finalNavbarData || !hydrated) {
    return null;
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
    <Disclosure as="nav" id="nav" className={`fixed top-0 w-full h-auto px-8 z-50 font-Headline text-white`} style={{ backgroundColor: navbarBgColor }}>
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
                <Link href="/">
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
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden sm:flex sm:items-center sm:space-x-4">
                <div className="flex space-x-8">
                  {renderNavLinks()}
                </div>

                {/* Shopping Cart Icon */}
                <div className="relative">
                  <button type="button" className="cart-icon flex items-center" onClick={() => setShowCart(true)}>
                    <AiOutlineShopping className="text-2xl" />
                    {totalQuantities > 0 && (
                      <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs h-4 w-4 flex items-center justify-center">
                        {totalQuantities}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Shopping Cart */}
              <div className="flex sm:hidden items-center absolute right-0 inset-y-0 space-x-4">
                <button type="button" className="cart-icon flex items-center" onClick={() => setShowCart(true)}>
                  <AiOutlineShopping className="text-2xl" />
                  {totalQuantities > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs h-4 w-4 flex items-center justify-center">
                      {totalQuantities}
                    </span>
                  )}
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

export default Navbar;