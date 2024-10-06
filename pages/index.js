import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import StylesObj from '../components/styles.js'
import Splash from '../components/Splash'
import About from '../components/About'
import Featured from '../components/Featured'
import Contact from '../components/Contact'
import MusicAndVideo from '../components/MusicAndVideo'
import { client } from '../lib/client'
import { PortableText } from '@portabletext/react'
import Newsletter from '../components/Newsletter'

const Home = ({ aboutCopy, videoData }) => {
  return (
    <div className={StylesObj.container}>
      <Splash/>
      <Newsletter/>
      {/* Pass the fetched 'about' data to the About component */}
      <About sectionCopy={aboutCopy} />
      {/* Pass all video-related data to MusicAndVideo */}
      <MusicAndVideo videoPreLink={videoData} />

      {/* Uncomment if you want to use these sections */}
      {/* <Featured />
      <Contact /> */}
    </div>
  )
}

export default Home;

export const getServerSideProps = async () => {
  // Fetch 'about' content
  const aboutQuery = "*[_type == 'about']";
  const aboutCopy = await client.fetch(aboutQuery);

  // Fetch video-related content
  const videoData = {
    vidLink: await client.fetch("*[_type == 'videoLink']"),
    heroLink: await client.fetch("*[_type == 'heroVideo']"),
    musicLink: await client.fetch("*[_type == 'musicLink']"),
  };

  return {
    props: {
      aboutCopy,  // Pass the 'about' data
      videoData   // Combine all video-related data in one object
    }
  };
};
