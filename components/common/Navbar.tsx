import { Fragment, useState, useEffect, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AiOutlineShopping } from 'react-icons/ai';
import anime from 'animejs';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cart from '../shop/Cart';
import { useStateContext } from '../../context/StateContext';
import { useNavbar } from '../../context/NavbarContext';
import { urlFor } from '../../lib/client';

// Define TypeScript interfaces
export interface NavigationLink {
  href: string;
  label: string;
  name?: string;
  current?: boolean;
}

export interface NavbarData {
  logo?: {
    _type: string;
    asset: {
      _ref: string;
      _type: string;
    };
  };
  isTransparent?: boolean;
  backgroundColor?: {
    hex: string;
  };
  navigationLinks?: NavigationLink[];
}

// Type the utility functions
const generateKey = (item: NavigationLink, index: number): string =>
  `${item.name}-${index}-${item.href}`;

const classNames = (...classes: string[]): string =>
  classes.filter(Boolean).join(' ');

// Update the Navbar component to accept props
const Navbar: React.FC<{ navbarData?: NavbarData }> = ({ navbarData: externalNavbarData }) => {
  const router = useRouter();
  const { navbarData: contextNavbarData, loading } = useNavbar();
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [hydrated, setHydrated] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Use external navbarData if provided, otherwise use context data
  const finalNavbarData = externalNavbarData || contextNavbarData;

  // Hydration and mobile state check
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

  // Scroll animation for mobile
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

  // Smooth scrolling effect
  const handleSmoothScroll = useCallback((e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      } else {
        const fallbackElement = Array.from(document.querySelectorAll('[id]')).find(
          el => el.id.toLowerCase() === targetId.toLowerCase()
        );
        if (fallbackElement) {
          fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', href);
        }
      }
    } else {
      router.push(href);
    }
  }, [router]);

  if (loading || !finalNavbarData || !hydrated) {
    return null;
  }

  const logoUrl = finalNavbarData.logo ? urlFor(finalNavbarData.logo).url() : '/default-logo.png';
  const navbarBgColor = finalNavbarData.isTransparent ? 'transparent' : finalNavbarData.backgroundColor?.hex || 'black';

  const renderNavLinks = (isMobile = false) => {
    return finalNavbarData.navigationLinks?.map((item: NavigationLink, index: number) => {
      const key = generateKey(item, index);
      const linkProps = {
        href: item.href,
        className: classNames(
          item.name === 'BUY' ? 'text-green-400' : 'text-white',
          'px-2 py-2 rounded-md text-sm font-medium hover:text-green-400'
        ),
        onClick: (e: React.MouseEvent) => handleSmoothScroll(e, item.href)
      };

      const linkContent = item.name;

      if (isMobile) {
        return (
          <Disclosure.Button
            key={key}
            as="a"
            {...linkProps}
            className={classNames(
              item.current ? 'bg-gray-900 text-white' : 'bg-gray-500/50 text-white hover:bg-black hover:text-white',
              'block px-3 py-2 rounded-md text-base font-medium'
            )}
          >
            {linkContent}
          </Disclosure.Button>
        );
      }

      return <Link key={key} {...linkProps}>{linkContent}</Link>;
    });
  };

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
                    className="h-12 w-auto"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/default-logo.png';
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
