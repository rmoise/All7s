import { Fragment, useState, useEffect } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import anime from 'animejs'
import Link from 'next/link'
import Cart from '../Cart'
import { useStateContext } from '../../context/StateContext'
import { AiOutlineShopping } from 'react-icons/ai'

const navigation = [
  { name: 'LOOK', href: '/#LOOK', current: false },
  { name: 'LISTEN', href: '/#LISTEN', current: false },
  { name: 'LEARN', href: '/blog/posts', current: false },
  { name: 'LOVE', href: '/contact', current: false },
  { name: 'BUY', href: '/shop', current: false },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const { showCart, setShowCart, totalQuantities } = useStateContext()
  const [mobile, setMobile] = useState(false)

  // Detect mobile device by screen width
  useEffect(() => {
    const checkMobile = () => {
      setMobile(window.innerWidth < 768)
    }
    checkMobile() // Set initially
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile) // Cleanup listener
  }, [])

  // Scroll effect for mobile
  useEffect(() => {
    if (mobile) {
      let lastScrollTop = 0
      const navbar = document.getElementById('nav')

      const handleScroll = () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop
        if (scrollTop > lastScrollTop) {
          anime({
            targets: '#nav',
            translateY: -80,
          })
        } else {
          anime({
            targets: '#nav',
            translateY: 15,
          })
        }
        lastScrollTop = scrollTop
      }

      window.addEventListener('scroll', handleScroll)

      return () => {
        window.removeEventListener('scroll', handleScroll) // Cleanup listener
      }
    }
  }, [mobile])

  return (
    <Disclosure as="nav" className="fixed top-0 w-screen h-auto px-12 z-50 font-Headline text-white" id="nav">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0"></div>
                <div className="hidden sm:ml-6 sm:block flex">
                  <div className="absolute right-[5rem]">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.name === 'BUY' ? 'text-green-400' : 'text-white hover:text-white',
                          'px-3 py-2 rounded-md text-sm font-medium font-Headline'
                        )}
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" className="cart-icon" onClick={() => setShowCart(true)}>
                <span className="cart-item-qty">{totalQuantities}</span>
                <span>
                  <AiOutlineShopping />
                </span>
              </button>
              {showCart && <Cart />}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Menu as="div" className="relative ml-3">
                  <div>
                    <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      <span className="sr-only">Open user menu</span>
                    </Menu.Button>
                  </div>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-black' : '', 'block px-4 py-2 text-sm text-black')}
                          >
                            Your Profile
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-black' : '', 'block px-4 py-2 text-sm text-black')}
                          >
                            Settings
                          </a>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href="#"
                            className={classNames(active ? 'bg-black' : '', 'block px-4 py-2 text-sm text-black')}
                          >
                            Sign out
                          </a>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-500/50 text-white hover:bg-black hover:text-white',
                    'block px-3 py-2 rounded-md text-base font-medium'
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}
