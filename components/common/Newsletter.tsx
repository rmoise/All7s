import React, { useState, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Grid from '@components/common/Grid/Grid'
import useOnClickOutside from '../../hooks/useOnClickOutside'

interface NewsletterProps {
  newsletter: {
    headline?: string
    description?: string
    placeholderText?: string
    ctaText?: string
    formName?: string
    notification?: {
      title?: string
      description?: string
      showSocialLinks?: boolean
      socialLinksTitle?: string
      socialLinks?: Array<{
        platform: string
        url: string
        color?: {
          hex?: string
        }
      }>
    }
  }
}

interface NotificationState {
  show: boolean;
  error: boolean;
  title?: string;
  description?: string;
  showSocialLinks?: boolean;
  socialLinks?: Array<{
    platform: string;
    url: string;
    color?: {
      hex?: string;
    }
  }>;
  socialLinksTitle?: string;
}

const XIcon: React.FC = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const defaultSocialLinks = [
  {
    platform: 'X',
    url: 'https://x.com/all7z',
    color: { hex: '#FFFFFF' },
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/all7z',
    color: { hex: '#E1306C' },
  },
]

const Newsletter: React.FC<NewsletterProps> = ({ newsletter }) => {
  console.log('Newsletter props:', {
    newsletter,
    hasNotification: !!newsletter?.notification,
    notificationContent: newsletter?.notification,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    error: false
  })
  const modalRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(modalRef, () =>
    setNotification({ show: false, error: false })
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('email', email);
      formData.append('form-name', newsletter?.formName || 'newsletter');

      const response = await fetch('/.netlify/functions/form-submission', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setEmail('');
      setNotification({
        show: true,
        error: false,
        title: newsletter?.notification?.title || 'Thank you for signing up!',
        description: newsletter?.notification?.description || 'You will receive our newsletter shortly.',
        showSocialLinks: newsletter?.notification?.showSocialLinks ?? true,
        socialLinks: newsletter?.notification?.socialLinks || defaultSocialLinks,
        socialLinksTitle: newsletter?.notification?.socialLinksTitle || 'Follow us on social media',
      });

    } catch (error) {
      setNotification({
        show: true,
        error: true,
        title: 'Error',
        description: 'Failed to sign up for newsletter. Please try again later.',
        showSocialLinks: false,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const InstagramIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
    </svg>
  )

  return (
    <section
      className="relative w-full z-3 overflow-hidden py-8"
      id="newsletter"
    >
      <Grid
        columns={{
          default: 1,
          lg: 2,
        }}
        gap={32}
        maxWidth="7xl"
        center
        className="py-8 px-6 sm:px-8 md:px-12 lg:px-24 xl:px-16"
      >
        <div className="lg:text-center self-start">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-Headline tracking-tight text-white mb-4">
            {newsletter?.headline || 'GET MORE ALL7Z'}
          </h2>
          <p className="text-md sm:text-lg lg:text-xl leading-snug text-gray-300 font-Headline">
            {newsletter?.description || 'SIGN UP TO HEAR MORE FROM US'}
          </p>
        </div>

        <div className="self-start lg:self-center lg:flex lg:justify-center">
          <form
            name="newsletter"
            method="POST"
            data-netlify="true"
            netlify-honeypot="bot-field"
            action="/.netlify/functions/newsletter"
            onSubmit={handleSubmit}
            className="w-full lg:max-w-md"
          >
            <input type="hidden" name="form-name" value="newsletter" />
            <div hidden>
              <input name="bot-field" />
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
              <div className="w-full lg:w-[300px] min-w-0">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  className="w-full h-[46px] rounded-md border border-transparent px-4 placeholder-gray-500 focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
                  placeholder={
                    newsletter?.placeholderText || 'Enter your email'
                  }
                />
              </div>

              <div className="w-full lg:w-[120px]">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-[46px] rounded-md border border-transparent text-base font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
                >
                  <span className="whitespace-nowrap">
                    {isSubmitting
                      ? 'Signing Up...'
                      : newsletter?.ctaText || 'Sign Up'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </Grid>

      {/* Notification Popup */}
      <Transition
        show={notification.show}
        appear={true}
        enter="transition-all ease-out duration-300"
        enterFrom="opacity-0 translate-y-4"
        enterTo="opacity-100 translate-y-0"
        leave="transition-all ease-in duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-4"
        as="div"
        className="fixed inset-0 z-50"
      >
        <div className="fixed inset-0 flex items-center justify-center px-8 sm:px-0">
          <Transition.Child
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-sm"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 backdrop-blur-sm"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            />
          </Transition.Child>

          <Transition.Child
            enter="transition-all ease-out duration-300"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="transition-all ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div
              ref={modalRef}
              className="relative w-full max-w-[calc(100%-32px)] sm:max-w-md transform-gpu"
            >
              <div className="w-full shadow-2xl rounded-lg pointer-events-auto ring-1 ring-white/10 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="p-8">
                  <button
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/10 transition-colors duration-200 text-gray-400"
                    onClick={() =>
                      setNotification((prev) => ({ ...prev, show: false }))
                    }
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center bg-green-500/10">
                        <CheckCircleIcon
                          className="h-8 w-8 animate-pulse text-green-500"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xl font-bold">
                        {newsletter?.notification?.title ||
                          'Successfully subscribed!'}
                      </p>
                      <p className="opacity-80">
                        {newsletter?.notification?.description ||
                          'Thanks for joining our newsletter.'}
                      </p>

                      {/* Only show social links if enabled */}
                      {newsletter?.notification?.showSocialLinks !== false && (
                        <div className="pt-4">
                          <p className="text-sm font-semibold mb-3">
                            Follow us:
                          </p>
                          <div className="flex justify-center space-x-6">
                            {(
                              newsletter?.notification?.socialLinks ||
                              defaultSocialLinks
                            ).map((link, index) => (
                              <a
                                key={index}
                                href={link.url}
                                className="transition-all duration-200 hover:opacity-100 hover:scale-110"
                                style={{
                                  color: link.color?.hex || '#FFFFFF',
                                  opacity: 0.9,
                                }}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Follow us on ${link.platform}`}
                              >
                                {link.platform.toLowerCase() === 'x' && (
                                  <XIcon />
                                )}
                                {link.platform.toLowerCase() ===
                                  'instagram' && <InstagramIcon />}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </section>
  )
}
export default Newsletter
