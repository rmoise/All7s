import { Fragment, useState } from 'react'
import { Popover, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'
import Sketch from '../media/Sketch'


const navigation = [
  { name: 'Work', href: '#' },
  { name: 'Services', href: '#' },
  { name: 'About', href: '#' },
  { name: 'Blog', href: '#' },
]

export default function Contact({ info }) {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [email, setEmail] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [comment, setComment] = useState('')

  return (
    <div className="bg-white">
      <main>
        {/* Contact Section */}
        <div className="relative bg-gray-900/50 mt-28">
          <div className="lg:absolute lg:inset-0">
            <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
              <div className="flex flex-col justify-center">
                <h1 className="mt-8 mb-8 font-Headline ml-8">PREVIOUS COMMENTS</h1>

                {info.map((comment, index) => (
                  <div className="sm:ml-8 mr-12" key={index}>
                    <span className="text-green-500">{comment.name}</span> from {comment.city}, {comment.state} said {comment.comment}
                    <br />
                    <br />
                  </div>
                ))}
              </div>
              <div className="absolute top-0">
                <Sketch />
              </div>
            </div>
          </div>
          <div className="relative py-16 px-4 sm:py-24 sm:px-6 lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:px-8 lg:py-32">
            <div className="lg:pr-8">
              <div className="mx-auto max-w-md sm:max-w-lg lg:mx-0">
                <h2 className="text-3xl font-bold font-Headline tracking-tight sm:text-4xl">
                  TELL US WHY YOU LOVE US
                </h2>

                {/* Fixed form component */}
                <form
                  name="stak-contact"
                  method="POST"
                  className="mt-9 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
                  data-netlify="true"
                >
                  <input type="hidden" name="form-name" value="stak-contact" />

                  <div>
                    <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                      FIRST
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="site-first-name"
                        id="first-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div id="mario">
                    <label htmlFor="last-name" className="block text-sm font-medium text-gray-700">
                      LAST
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="site-last-name"
                        id="last-name"
                        autoComplete="family-name"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      EMAIL
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="site-email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      CITY
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="site-city"
                        id="city"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      STATE
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="site-state"
                        id="state"
                        autoComplete="state"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <label htmlFor="newsletter" className="block text-sm font-medium text-gray-700">
                      TUNE IN, TURN ON DROP US YOUR INFO!
                    </label>
                    <div className="mt-1">
                      <input
                        id="newsletter"
                        name="agree-newsletter"
                        type="checkbox"
                        className="rounded-md border-gray-300 shadow-sm focus:border-grape-500 focus:ring-grape-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex justify-between">
                      <label htmlFor="how-can-we-help" className="block text-sm font-medium text-gray-700">
                        LEAVE A COMMENT
                      </label>
                      <span id="how-can-we-help-description" className="text-sm text-gray-500">
                        MAX. 500 CHARACTERS
                      </span>
                    </div>
                    <div className="mt-1">
                      <textarea
                        id="how-can-we-help"
                        name="how-can-we-help"
                        aria-describedby="how-can-we-help-description"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                      ></textarea>
                    </div>
                  </div>

                  <div className="text-right sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-grape-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-grape-700 focus:outline-none focus:ring-2 focus:ring-grape-500 focus:ring-offset-2"
                    >
                      SUBMIT
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
