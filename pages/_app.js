// pages/_app.js
import App from 'next/app';
import Layout from '../components/layout/Layout';
import { client } from '../lib/client';

class MyApp extends App {
  static async getInitialProps(appContext) {
    // Retrieve the initial props of the page
    const appProps = await App.getInitialProps(appContext);

    // Define the Sanity query to fetch site settings
    const query = `*[_type == "settings"][0]{
      title,
      favicon{
        asset->{
          url,
          _updatedAt
        }
      },
      seo{
        metaTitle,
        metaDescription,
        openGraphImage{
          asset->{
            url
          }
        }
      },
      navbar{
        logo,
        navigationLinks[]{
          name,
          href
        },
        backgroundColor,
        isTransparent
      },
      footer{
        copyrightText,
        footerLinks[]{
          text,
          url
        },
        socialLinks[]{
          platform,
          url,
          iconUrl
        },
        fontColor,
        alignment
      }
    }`;

    try {
      // Fetch site settings from Sanity
      const siteSettings = await client.fetch(query);
      console.log("Fetched siteSettings:", siteSettings); // Debugging log

      return {
        ...appProps,
        pageProps: {
          ...appProps.pageProps,
          siteSettings,
        }
      };
    } catch (error) {
      console.error("Error fetching site settings:", error);
      return {
        ...appProps,
        pageProps: {
          ...appProps.pageProps,
          siteSettings: null,
        }
      };
    }
  }

  render() {
    const { Component, pageProps } = this.props;
    const { siteSettings } = pageProps;

    return (
      <Layout siteSettings={siteSettings}>
        <Component {...pageProps} />
      </Layout>
    );
  }
}

export default MyApp;
