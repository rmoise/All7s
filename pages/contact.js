import Contact from "../components/Contact";
import CustomP5Canvas from "../components/media/CustomP5Canvas";
import { client } from '../lib/client';
import SEO from '../components/common/SEO'; // Import your reusable SEO component

const ContactPage = ({ contactData }) => {
  const {
    title,
    description,
    address,
    phoneNumber,
    email,
    contactFormMessage,
    socialLinks,
    map,
    favicon,
    seo,
  } = contactData;

  // Combined SEO title for better branding consistency
  const pageTitle = seo?.metaTitle
    ? `${seo.metaTitle} - ${title || 'Contact Page'}`
    : title || 'Contact Us';

  return (
    <div>
      {/* SEO Component */}
      <SEO
        title={pageTitle}
        description={seo?.metaDescription || description || "Get in touch with us."}
        favicon={favicon?.asset?.url}
        openGraphImage={seo?.openGraphImage?.asset?.url}
        siteName={title || 'Contact Page'}
      />

      {/* Contact Component */}
      <Contact
        title={title}
        description={description}
        address={address}
        phoneNumber={phoneNumber}
        email={email}
        message={contactFormMessage}
        socialLinks={socialLinks}
        map={map}
      />

      {/* Custom Canvas Component */}
      <CustomP5Canvas />
    </div>
  );
};

export default ContactPage;

export const getServerSideProps = async () => {
  const query = "*[_type == 'contactPage'][0]";
  const contactData = await client.fetch(query);

  return {
    props: {
      contactData: contactData || {},
    },
  };
};
