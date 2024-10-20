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

// Utility function to generate a unique key for each link
const generateKey = (item, index) => `${item.name}-${index}-${item.href}`;

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const Navbar = () => {
  const router = useRouter();
  const { navbarData, loading } = useNavbar();
  const { showCart, setShowCart, totalQuantities } = useStateContext();
  const [hydrated, setHydrated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Hydration and mobile state check
  useEffect(() => {
    setHydrated(true);
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768);
      }
    };

    handleResize(); // Initialize state on mount
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
  const handleSmoothScroll = useCallback((e, href) => {
    e.preventDefault();
    console.log('Clicked link:', href);

    if (href.startsWith('/#')) {
      const targetId = href.substring(2);
      console.log('Target ID:', targetId);

      // Log all elements with IDs
      console.log('All elements with IDs:',
        Array.from(document.querySelectorAll('[id]')).map(el => ({ id: el.id, element: el }))
      );

      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        console.log('Target element found:', targetElement);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      } else {
        console.log('Target element not found');
        // Fallback: try case-insensitive search
        const lowercaseTargetId = targetId.toLowerCase();
        const fallbackElement = Array.from(document.querySelectorAll('[id]')).find(el => el.id.toLowerCase() === lowercaseTargetId);
        if (fallbackElement) {
          console.log('Fallback element found:', fallbackElement);
          fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', href);
        } else {
          console.log('No matching element found, even with case-insensitive search');
        }
      }
    } else {
      router.push(href);
    }
  }, [router]);

  // Render nothing while loading or if navbar data isn't ready
  if (loading || !navbarData || !hydrated) {
    return null;
  }

  const logoUrl = navbarData.logo ? urlFor(navbarData.logo).url() : '/default-logo.png';
  const navbarBgColor = navbarData.isTransparent ? 'transparent' : navbarData.backgroundColor?.hex || 'black';

  const renderNavLinks = (isMobile = false) => {
    return navbarData.navigationLinks?.map((item, index) => {
      const linkProps = {
        key: generateKey(item, index),
        href: item.href,
        className: classNames(
          item.name === 'BUY' ? 'text-green-400' : 'text-white',
          'px-2 py-2 rounded-md text-sm font-medium hover:text-green-400'
        ),
        onClick: (e) => handleSmoothScroll(e, item.href)
      };

      const linkContent = item.name;

      if (isMobile) {
        return (
          <Disclosure.Button
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

      return <Link {...linkProps}>{linkContent}</Link>;
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
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-logo.png';
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
