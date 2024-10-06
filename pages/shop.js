import Link from "next/link";
import HeroBanner from "../components/HeroBanner";
import Product from "../components/Product";
import FooterBanner from "../components/FooterBanner/FooterBanner";
import { client } from "../lib/client";
import imageUrlBuilder from '@sanity/image-url';

// Image URL builder
const builder = imageUrlBuilder(client);

// Function to handle image URLs, returns a placeholder if the source is null or undefined
function urlFor(source) {
  if (!source) {
    console.warn("Attempted to resolve image URL from a null or undefined source, using placeholder image.");
    return '/images/placeholder.png';  // Fallback image when no image source is available
  }
  return builder.image(source).url();
}

const Shop = ({ products, bannerData }) => {
  // Defensive check: log and ensure valid image data is present
  console.log("Products fetched:", products);  // Log the products to check for valid image data
  console.log("Banner data fetched:", bannerData);  // Log the banner data

  return (
    <div className="layout">
      <div className="main-container">
        {/* Defensive check: Render HeroBanner only if bannerData has valid content */}
        {bannerData.length > 0 && bannerData[0]?.image && (
          <HeroBanner heroBanner={bannerData[0]} />
        )}

        <div className="products-heading">
          <h2 className="text-white font-Headline">SHOP ALL7Z</h2>
        </div>

        <div className="products-container">
          {products?.map((product) => (
            // Defensive check: Ensure product has a valid image before rendering
            product?.image && <Product key={product._id} product={product} />
          ))}
        </div>

        {/* Render FooterBanner only if bannerData has content and the image exists */}
        {bannerData.length > 0 && bannerData[0]?.image && (
          <FooterBanner footerBanner={bannerData[0]} />
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  try {
    // Fetch products with image URLs
    const query = '*[_type == "product"]{..., "image": image.asset->url}'; // Ensure image field exists
    // Fetch banner data with image URLs
    const bannerQuery = '*[_type == "banner"]{..., "image": image.asset->url}'; // Ensure image field exists

    const products = await client.fetch(query);
    const bannerData = await client.fetch(bannerQuery);

    // Log fetched data for debugging
    console.log('Fetched Products:', products);
    console.log('Fetched Banner Data:', bannerData);

    return {
      props: { products, bannerData },
    };
  } catch (error) {
    console.error('Error fetching data from Sanity:', error);
    return {
      props: {
        products: [],
        bannerData: [],
      },
    };
  }
};

export default Shop;
