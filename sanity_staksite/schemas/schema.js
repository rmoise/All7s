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
import footer from './documents/footer';         // Import Footer schema
import heroBanner from './objects/heroBanner'; // Import HeroBanner schema
import homePage from './documents/homePage';   // Import home page schema
import newsletter from './objects/newsletter'; // Import Newsletter schema
import navbar from './documents/navbar';
import siteSettings from './documents/siteSettings'; // Import SiteSettings schema
import contactPage from './documents/contactPage';
import musicAndVideo from './objects/musicAndVideo';
import album from './objects/album';




// Export all schemas
export default [
  post,
  author,
  category,
  about,
  youtube,
  blockContent,
  musicLink,
  videoLink,
  heroVideo,
  banner,
  product,
  comments,
  footer,          // Add Footer schema
  heroBanner,      // Add HeroBanner schema
  homePage,        // Add home page schema
  newsletter,
  navbar,          // Add Navbar schema
  siteSettings,    // Add SiteSettings schema for favicon and SEO
   contactPage,
   musicAndVideo,
    album,
];
