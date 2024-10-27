import ContactComponent from "../components/Contact";
import CustomP5Canvas from "../components/media/CustomP5Canvas";
import { client } from '../lib/client';
import SEO from '../components/common/SEO';
import { useEffect, useState } from 'react';

const ContactPage = ({ contactData }) => {
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Check if contactData is loaded and log it
    console.log("Fetched contactData:", contactData);
    if (contactData && Object.keys(contactData).length) {
      setDataLoaded(true);
    }
  }, [contactData]);

  // Display loading text only if data is not loaded
  if (!dataLoaded) {
    return <p>Loading site settings...</p>;
  }

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
    info,
  } = contactData;

  const pageTitle = seo?.metaTitle
    ? `${seo.metaTitle} - ${title || 'Contact Page'}`
    : title || 'Contact Us';

  return (
    <div>
      <SEO
        title={pageTitle}
        description={seo?.metaDescription || description || "Get in touch with us."}
        favicon={favicon?.asset?.url}
        openGraphImage={seo?.openGraphImage?.asset?.url}
        siteName={title || 'Contact Page'}
      />

      <ContactComponent
        info={info || []}
        title={title}
        description={description}
        address={address}
        phoneNumber={phoneNumber}
        email={email}
        message={contactFormMessage}
        socialLinks={socialLinks}
        map={map}
      />

      <CustomP5Canvas />
    </div>
  );
};

export default ContactPage;

export const getServerSideProps = async () => {
  console.log("Running getServerSideProps...");

  try {
    const query = "*[_type == 'contactPage'][0]{title}";
    const contactData = await client.fetch(query);

    console.log("Fetched data:", contactData); // Log the fetched data for verification

    return {
      props: {
        contactData: contactData || {}, // Pass fetched data as props
      },
    };
  } catch (error) {
    console.error("Error fetching data from Sanity:", error.message); // Log any error encountered
    return {
      props: {
        contactData: {}, // Return empty if an error occurs
      },
    };
  }
};

