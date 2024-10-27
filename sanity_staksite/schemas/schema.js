// schemas/schema.js
import blockContent from './objects/blockContent';
import category from './modules/category';
import post from './documents/post';
import author from './documents/author';
import about from './documents/about';
import youtube from './objects/youtube';
import musicLink from './objects/musicLink';
import videoLink from './objects/videoLink';
import heroVideo from './objects/heroVideo';
import product from './documents/product';
import banner from './modules/banner';
import comments from './documents/comments';
import footer from './documents/footer';
import heroBanner from './objects/heroBanner';
import homePage from './documents/home';
import newsletter from './objects/newsletter';
import navbar from './documents/navbar';
import siteSettings from './documents/settings';
import contactPage from './documents/contactPage';
import album from './objects/album';
import colorTheme from './documents/colorTheme';
import page from './documents/page';
import collection from './documents/collection';
import additionalVideo from './objects/additionalVideo'; // Add this line


// New block schemas
import musicBlock from './objects/musicBlock';
import videoBlock from './objects/videoBlock';
import backgroundVideoBlock from './objects/backgroundVideoBlock';

export default [
  blockContent,
  category,
  post,
  author,
  about,
  youtube,
  musicLink,
  videoLink,
  heroVideo,
  product,
  banner,
  comments,
  footer,
  heroBanner,
  homePage,
  newsletter,
  navbar,
  siteSettings,
  contactPage,
  album,
  colorTheme,
  page,
  collection,
  musicBlock,           // New MusicBlock schema
  videoBlock,           // New VideoBlock schema
  backgroundVideoBlock, // New BackgroundVideoBlock schema
    additionalVideo,      // Make sure to include this line

];
