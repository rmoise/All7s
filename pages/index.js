import Head from 'next/head';
import styles from '../styles/Home.module.css';
import StylesObj from '../components/styles.js';
import Splash from '../components/Splash';
import About from '../components/About';
import MusicAndVideo from '../components/MusicAndVideo';
import Newsletter from '../components/Newsletter';
import { client } from '../lib/client';

// Home Page Component
const Home = ({ clientFetch, vidLink, heroLink, musicLink }) => {
  return (
    <div className={StylesObj.container}>
      <Splash />
      <Newsletter />
      <About sectionCopy={clientFetch} />
      <MusicAndVideo videoPreLink={{ vidLink, heroLink, musicLink }} />
    </div>
  );
};

export const getServerSideProps = async () => {
  // Fetch content for "About", "VideoLink", "HeroVideo", and "MusicLink"
  const query = "*[_type == 'about']";
  const clientFetch = await client.fetch(query);

  const query2 = "*[_type == 'videoLink']";
  const vidLink = await client.fetch(query2);

  const query3 = "*[_type == 'heroVideo']";
  const heroLink = await client.fetch(query3);

  const query4 = "*[_type == 'musicLink']";
  const musicLink = await client.fetch(query4);

  return {
    props: {
      clientFetch,
      vidLink,
      heroLink,
      musicLink,
    },
  };
};

export default Home;
