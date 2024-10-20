import React, { useState, useEffect } from 'react';
import { urlFor } from '../../lib/client';
import { useStateContext } from '../../context/StateContext';
import Product from '../../components/shop/Product';
import Head from 'next/head';
import toast from 'react-hot-toast';

const ProductDetails = ({ product, products }) => {
  if (!product) {
    return <div>Product not found</div>;
  }

  const { image, name, details, price, seo } = product;
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart, cartCheck, setCartCheck } = useStateContext();
  const [clicked, setClicked] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setMobile(true);
    }
  }, []);

  const pageTitle = seo?.metaTitle ? `${seo.metaTitle} - ${name}` : name;

  return (
    <div>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={seo?.metaDescription || details} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={seo?.metaDescription || details} />
        {seo?.openGraphImage?.asset?.url && (
          <meta property="og:image" content={seo.openGraphImage.asset.url} />
        )}
        <link
          rel="icon"
          href={product?.favicon?.asset?.url ? `${product.favicon.asset.url}?v=${product.favicon.asset._updatedAt || '1'}` : '/favicon.ico'}
        />
      </Head>

      <div className="z-50 ml-12 border border-black w-fit cursor-pointer text-[#1FE827] mb-12">
        {/* Add back link */}
      </div>
      <div className="main-container z-10">
        <div className="product-detail-container">
          <div>
            <div className="image-container">
              <img
                src={urlFor(image && image[index]) || '/images/placeholder.png'}
                alt={name || 'Product Image'}
                className="product-detail-image h-auto"
                width="300"
                height="300"
              />
            </div>
          </div>
        </div>
        <div className="small-images-container ml-10">
          {image?.map((item, i) => (
            <img
              key={i}
              src={urlFor(item) || '/images/placeholder.png'}
              className={i === index ? 'small-image selected-image' : 'small-image'}
              onMouseEnter={() => setIndex(i)}
              alt={name}
            />
          ))}
        </div>

        <div className="ml-10 mt-14 w-fit">
          <div className="product-detail-desc ml-10 mt-1">
            <h1>{name}</h1>
            <h4>Details:</h4>
            <p>{details}</p>
            <p className="price">${price}</p>
            <div className="quantity flex flex-col items-center">
              <h3 className="mt-8 mb-3">Quantity</h3>
              <p className="quanity-desc flex gap-x-3 ">
                <span className="minus" onClick={decQty}>
                  -
                </span>
                <span className="num">{qty}</span>
                <span className="plus" onClick={incQty}>
                  +
                </span>
              </p>
              <div className="buttons">
                <button
                  type="button"
                  className="border border-gray-700 bg-black bg-gray-500 rounded-md w-40 h-14"
                  onClick={() => {
                    if (!cartCheck.includes(product._id)) {
                      setCartCheck([...cartCheck, product._id]);
                      setClicked(true);
                      onAdd(product, qty);
                    } else {
                      toast.error('Item already in cart');
                    }
                  }}
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        </div>
        {!mobile && (
          <div className="maylike-products-wrapper flex flex-col items-center mt-12">
            <h2 className="bg-black">More to love</h2>
            <div className="marquee">
              <div className="maylike-products-container track">
                {products.map((item) => (
                  <Product key={item._id} product={item} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

// Fetch data from Sanity
export const getServerSideProps = async (context) => {
  const productId = context.query.id;
  const productQuery = `*[_type == "product" && _id == "${productId}"][0]{
    ...,
    "seo": seo{
      metaTitle,
      metaDescription,
      openGraphImage{
        asset->{
          url
        }
      }
    }
  }`;

  const productsQuery = '*[_type == "product"]{..., "image": image.asset->url}';

  const product = await client.fetch(productQuery);
  const products = await client.fetch(productsQuery);

  return {
    props: {
      product: product || null,
      products: products || [],
    },
  };
};
