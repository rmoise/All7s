import React, { useState, useEffect } from 'react';
import { urlFor } from '../../lib/client';
import { useStateContext } from '../../context/StateContext';
import Product from '../../components/Product';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ProductDetails = ({ product, products }) => {
  const { image, name, details, price } = product;
  const [index, setIndex] = useState(0);
  const { decQty, incQty, qty, onAdd, setShowCart, cartCheck, setCartCheck } = useStateContext();
  const [clicked, setClicked] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setMobile(true);
    }
  }, []);

  return (
    <div>
      <div className="z-50 ml-12 border border-black w-fit cursor-pointer text-[#1FE827] mb-12">
        {/* <Link href="/shop">
          <p>BACK TO SHOP</p>
        </Link> */}
      </div>
      <div className="main-container z-10">
        <div className="product-detail-container">
          <div>
            <div className="image-container">
              {/* Add a fallback image if the image is undefined */}
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
            <div className="reviews flex-col"></div>
            <h4>Details: </h4>
            <p className="">{details}</p>
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
