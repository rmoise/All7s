import { Contact } from "../components/Contact";
import CustomP5Canvas from "../components/media/CustomP5Canvas";
import { client } from '../lib/client';
import SEO from '../components/common/SEO';
import { useEffect, useState } from 'react';

interface ContactData {
  title?: string;
  description?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  contactFormMessage?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  map?: {
    lat: number;
    lng: number;
    zoom: number;
  };
  favicon?: {
    asset?: {
      url?: string;
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: {
      asset?: {
        url?: string;
      };
    };
  };
  info?: Array<{
    name: string;
    city: string;
    state: string;
    comment: string;
  }>;
}

interface ContactPageProps {
  contactData: ContactData;
}

const ContactPage = ({ contactData }: ContactPageProps) => {
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    console.log("Fetched contactData:", contactData);
    if (contactData && Object.keys(contactData).length) {
      setDataLoaded(true);
    }
  }, [contactData]);

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
        faviconUrl={favicon?.asset?.url}
        openGraphImageUrl={seo?.openGraphImage?.asset?.url}
        siteName={title || 'Contact Page'}
        canonicalUrl="https://yourdomain.com"
      />

      <Contact
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

    console.log("Fetched data:", contactData);

    return {
      props: {
        contactData: contactData || {},
      },
    };
  } catch (error) {
    console.error("Error fetching data from Sanity:", error instanceof Error ? error.message : 'Unknown error');
    return {
      props: {
        contactData: {},
      },
    };
  }
};

