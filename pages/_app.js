import React from 'react'
import '../styles/globals.css'
import Head from 'next/head'
import Layout from '../components/layout'
import { StateContext } from '../context/StateContext'
import { Toaster } from 'react-hot-toast'
function MyApp({ Component, pageProps }) {

  return (
  <>
  <Head>
    <title>ALL7Z</title>
    {/* <link rel="icon" href="../public/white-rabbit-cursor.png" /> */}
    <link rel="icon" href="/favicon.ico" />
       <meta name="viewport" content="initial-scale=1.0, width=device-width" />
       <meta name="description" content="All 7z: Music, Lifestyle, Merch" />
       <meta name="robots" content="index, follow"/>
       <meta property="og:title" content="All 7z: Music, Lifestyle, Merch"/>
       <meta property="og:site_name" content="All 7z Brand"/>
       <meta property="og:description" content="Explore the All 7z Brand. West Coast Music, Lifestyle, Merch"/>
       <meta property="twitter:title" content="All 7z: Music, Lifestyle, Merch"/>
       <meta property="twitter:description" content="Explore the All 7z Brand. West Coast Music, Lifestyle, Merch"/>
      
  </Head>

  <StateContext>
  <Layout>
    <Toaster/>
      <Component {...pageProps} />
  </Layout>
  </StateContext>
  </>
  )
}

export default MyApp
