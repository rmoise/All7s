'use client'

import React from 'react'
import Container from '@/components/Blog/Container'
import { FooterSettings, FooterButton } from '@/types/sanity'
import { usePathname } from 'next/navigation'

interface FooterProps {
  footer: FooterSettings
}

const Footer: React.FC<FooterProps> = ({ footer }) => {
  const pathname = usePathname()
  const isShopPage = pathname === '/shop' || pathname.startsWith('/shop/')

  if (!footer) {
    return (
      <footer className="w-full bg-black py-4 relative z-20">
        <div className="flex justify-center items-center">
          <h1 className="text-xs sm:text-sm font-sans font-normal text-white">
            © 2024 All Rights Reserved
          </h1>
        </div>
      </footer>
    )
  }

  const { copyrightText = '© 2024 All Rights Reserved', connectSection } =
    footer

  return (
    <>
      {/* Connect Section */}
      {connectSection && (
        <footer className="bg-black border-t border-gray-800">
          <Container>
            <div className="py-28 flex flex-col lg:flex-row items-center">
              <h3 className="text-4xl lg:text-5xl font-bold tracking-tighter leading-tight text-center lg:text-left mb-10 lg:mb-0 lg:pr-4 lg:w-1/2 text-white">
                {connectSection.title}
              </h3>
              <div className="flex flex-col lg:flex-row justify-center items-center lg:pl-4 lg:w-1/2">
                {connectSection.buttons
                  ?.filter((button) => !(isShopPage && button.url === '/shop'))
                  .map((button: FooterButton, index: number) => (
                    <a
                      key={index}
                      href={button.url}
                      className={`mx-3 font-bold py-3 px-12 lg:px-8 duration-200 transition-colors mb-6 lg:mb-0 rounded-md ${
                        button.style === 'primary'
                          ? 'bg-white hover:bg-black hover:text-white text-black border border-white'
                          : 'bg-black hover:bg-white hover:text-black border border-white text-white'
                      }`}
                    >
                      {button.label}
                    </a>
                  ))}
              </div>
            </div>
          </Container>
        </footer>
      )}

      {/* Copyright Section */}
      <footer
        className="w-full bg-black py-4 relative z-20"
        style={{ color: footer.fontColor?.hex || '#FFFFFF' }}
      >
        <div className={`flex justify-${footer.alignment || 'center'} px-4`}>
          <h1 className="text-xs sm:text-sm font-sans font-normal">
            {copyrightText}
          </h1>
        </div>
      </footer>
    </>
  )
}

export default Footer
