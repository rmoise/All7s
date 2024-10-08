import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import Head from 'next/head';
import Image from 'next/image';
import StylesObj from '../components/styles.js';
import Splash from '../components/Splash';
import About from '../components/About';
import MusicAndVideo from '../components/MusicAndVideo';
import Newsletter from '../components/Newsletter';

const getSanityConfig = () => {
  let dataset, token;

  if (typeof window !== 'undefined') {
    // Client-side logic
    dataset = localStorage.getItem('sanityDataset') || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    token = localStorage.getItem('sanityToken') || process.env.NEXT_PUBLIC_SANITY_TOKEN;
  } else {
    // Server-side logic
    dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
    token = process.env.NEXT_PUBLIC_SANITY_TOKEN || null;
  }

  return {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset,
    apiVersion: '2022-10-29',
    useCdn: dataset === 'production', // Only use CDN for production
    token,
  };
};

// Create the Sanity client using the configuration
export const client = createClient(getSanityConfig());

// Helper function to build image URLs
export const urlFor = (source) => imageUrlBuilder(client).image(source);

const Home = ({ aboutCopy, videoData }) => {
  return (
    <div className={StylesObj.container}>
      <Splash />
      <Newsletter />
      <About sectionCopy={aboutCopy} />
      <MusicAndVideo videoPreLink={videoData} />
    </div>
  );
};

export default Home;

export const getServerSideProps = async () => {
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
  const aboutQuery = "*[_type == 'about']";
  const aboutCopy = await client.fetch(aboutQuery);

  const videoData = {
    vidLink: await client.fetch("*[_type == 'videoLink']"),
    heroLink: await client.fetch("*[_type == 'heroVideo']"),
    musicLink: await client.fetch("*[_type == 'musicLink']"),
  };

  return {
    props: {
      aboutCopy,
      videoData,
    },
  };
};
