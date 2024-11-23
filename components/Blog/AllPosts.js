/*
  This example requires some changes to your config:

  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/

import { client } from '../../lib/sanity';
import {PortableText} from '@portabletext/react'
import Link from 'next/link'

// const posts = [
//     {
//       title: 'Look Both Ways',
//       href: '#',
//       description:
//         'Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.',
//       date: 'Mar 16, 2020',
//       datetime: '2020-03-16',
//     },
//     {
//       title: 'Tour Biz',
//       href: '#',
//       description: 'Optio cum necessitatibus dolor voluptatum provident commodi et. Qui aperiam fugiat nemo cumque.',
//       date: 'Mar 10, 2020',
//       datetime: '2020-03-10',
//     },
//     {
//       title: 'Up in Smoke',
//       href: '#',
//       description:
//         'Cupiditate maiores ullam eveniet adipisci in doloribus nulla minus. Voluptas iusto libero adipisci rem et corporis.',
//       date: 'Feb 12, 2020',
//       datetime: '2020-02-12',
//     },
//     {
//       title: 'Watch your 7',
//       href: '#',
//       description:
//         'Ipsum voluptates quia doloremque culpa qui eius. Id qui id officia molestias quaerat deleniti. Qui facere numquam autem libero quae cupiditate asperiores vitae cupiditate. Cumque id deleniti explicabo.',
//       date: 'Jan 29, 2020',
//       datetime: '2020-01-29',
//     },
//   ]

  const AllPosts=({ postInfo })=> {
    return (

      <div className="bg-black px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="relative mx-auto max-w-lg divide-y-2 divide-white lg:max-w-7xl">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-Headline">ALL7Z BLOG</h2>
            {/* <div className="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:items-center lg:gap-5"> */}
              {/* <p className="text-xl text-gray-500"></p> */}
              {/* <form name="blog" method="POST" className="mt-6 flex flex-col sm:flex-row lg:mt-0 lg:justify-end" data-netlify="true">
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    Email address
                  </label>

                </div>
                <div className="mt-2 flex w-full flex-shrink-0 rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:inline-flex sm:w-auto">

                </div>
              </form> */}
            {/* </div> */}
          </div>
          <div className="mt-6 grid gap-16 pt-10 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
            {postInfo.map((post) => (

              <div key={post.title}>

                <p className="text-sm text-white"></p>
                <a href="#" className="mt-2 block">
                  <p className="text-xl font-semibold white font-Headline">{post.title}</p>
                </a>
                <div className="mt-3">
                  <Link href={'/blog/'+ post.title.split(" ").join("-").toLowerCase()} key={post.id} className="text-base font-semibold text-indigo-600 hover:text-indigo-500">
                    Read full story
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  export default AllPosts

