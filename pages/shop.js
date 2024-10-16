import Link from "next/link";
import HeroBanner from "../components/home/HeroBanner";
import Product from "../components/shop/Product";
import FooterBanner from "../components/common/FooterBanner";
import { client } from "../lib/client";
import imageUrlBuilder from '@sanity/image-url';
import SEO from '../components/common/SEO'; // Import your reusable SEO component

const builder = imageUrlBuilder(client);

function urlFor(source) {
  if (!source) {
    console.warn("Attempted to resolve image URL from a null or undefined source, using placeholder image.");
    return '/images/placeholder.png';
  }
  return builder.image(source).url();
}

const Shop = ({ products, bannerData, seo }) => {
  return (
    <div className="layout">
      {/* SEO Component */}
      <SEO
        title={seo?.metaTitle || 'Shop - All7Z Brand'}
        description={seo?.metaDescription || 'Browse our collection of products from All7Z.'}
        openGraphImage={seo?.openGraphImage?.asset?.url}
      />

      <div className="main-container">
        {bannerData.length > 0 && bannerData[0]?.image && (
          <HeroBanner heroBanner={bannerData[0]} />
        )}

        <div className="products-heading">
          <h2 className="text-white font-Headline">SHOP ALL7Z</h2>
        </div>

        <div className="products-container">
          {products?.map((product) => (
            product?.image && <Product key={product._id} product={product} />
          ))}
        </div>

        {bannerData.length > 0 && bannerData[0]?.image && (
          <FooterBanner footerBanner={bannerData[0]} />
        )}
      </div>
    </div>
  );
};

export default Shop;

export const getServerSideProps = async () => {
  try {
    const productsQuery = '*[_type == "product"]{..., "image": image.asset->url}';
    const bannerQuery = '*[_type == "banner"]{..., "image": image.asset->url}';
    const seoQuery = '*[_type == "shopPageSEO"][0]{metaTitle, metaDescription, openGraphImage{asset->{url}}}';

    const products = await client.fetch(productsQuery);
    const bannerData = await client.fetch(bannerQuery);
    const seo = await client.fetch(seoQuery);

    return {
      props: {
        products: products || [],
        bannerData: bannerData || [],
        seo: seo || {},
      },
    };
  } catch (error) {
    console.error('Error fetching data from Sanity:', error);
    return {
      props: {
        products: [],
        bannerData: [],
        seo: {},
      },
    };
  }
};
