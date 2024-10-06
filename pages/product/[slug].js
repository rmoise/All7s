import {client, urlFor} from '../../lib/client'
import {AiOutlineMinus, AiOutlinePlus, AiFillStar, AiOutlineStar} from 'react-icons/ai'
import  Product  from '../../components/Product'
import { useState, useEffect } from 'react'
import { useStateContext } from '../../context/StateContext'
import Link from 'next/link'
import toast from 'react-hot-toast'

const ProductDetails = ({ product, products}) => {
    const {image, name, details, price } = product;
    const [index, setIndex] = useState(0)
    const { decQty, incQty, qty, onAdd, setShowCart, cartCheck, setCartCheck} = useStateContext();
    const [clicked, setClicked] = useState(false);
    const [cartItem, setCartItem] = useState([])
    const [mobile, setMobile] = useState(false);

    useEffect(() =>{
        if(window.innerWidth < 768) {
            setMobile(true);
        }
    })

    return (
        <div>
                <div className="z-50 ml-12 border border-black w-fit cursor-pointer text-[#1FE827] mb-12">
                        {/* <Link href="/shop">
                            <p>BACK TO SHOP</p>
                        </Link> */}
                </div>
            <div className ="main-container z-10">
            <div className="product-detail-container">
                <div>
                    <div className="image-container">
                        <img src={urlFor(image && image [index])} alt="ALL7z Product" className="product-detail-image h-auto" width="300" height="300"></img>
                    </div>
                </div>
            </div>
            <div className="small-images-container ml-10">
                {image?.map((item, i) =>  (
                    <img 
                        key={i}
                        src={urlFor(item) }
                         className={i === index ? 'small-image selected-image': 'small-image'}
                         onMouseEnter={()=>setIndex(i)}
                    />

                ))}
            </div>

                <div className="ml-10 mt-14 w-fit">
                       
            <div className="product-detail-desc ml-10 mt-1">
                <h1>{name}</h1>
                <div className="reviews flex-col">
               
                    </div>

                    {/* <div>
                       <AiFillStar />
                        <AiFillStar />
                        <AiFillStar />
                        <AiFillStar />
                        <AiFillStar />
                        <AiFillStar />
                        <AiFillStar />
                    </div> */}
                    {/* <p>
                        (77)  
                    </p> */}
                    <h4>Details: </h4>
                    
                    <p className="">{details}</p>
                    <p className="price">${price}</p>
                    <div className="quantity flex flex-col items-center">
                        <h3 className="mt-8 mb-3">Quantity</h3>
                        <p className="quanity-desc flex gap-x-3 ">
                            <span className="minus" onClick={decQty}><AiOutlineMinus/></span>
                            <span className="num">{qty}</span>
                            <span className="plus" onClick={incQty}><AiOutlinePlus/></span>
                        </p>
                        <div className="buttons">
                            <button type="button"
                                    className="border border-gray-700 bg-black bg-gray-500 rounded-md w-40 h-14"
                                    onClick={()=>{
                                        console.log(cartCheck)
                                        if (!cartCheck.includes(product._id)) {
                                        setCartCheck([...cartCheck, product._id])
                                        setClicked(true)
                                        onAdd(product, qty) 
                                        console.log(cartCheck)
                                        } else {
                                        toast.error('item already in cart')
                                        }
                                        }}>ADD TO CART
                            </button>
                            
                            {/* <button type="button"
                                    className='buy-now' 
                                    onClick="">BUY NOW
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
           {!mobile && <div className="maylike-products-wrapper flex flex-col items-center mt-12">
                <h2 className="bg-black">More to love</h2>
                <div className="marquee ">
                    <div className="maylike-products-container track">{products.map((item)=><Product key={item._id} product={item}/>)}</div>
                </div>
            </div>}
            </div>
        </div>
       
    )
}

export const getStaticPaths = async () => {
    const query = `*[_type == "product"] {
        slug {
            current
        }
    }`;

    const products = await client.fetch(query)
    const paths = products.map((product)=> ({
        params: {
            slug: product.slug.current
        }
    }));

    return {
        paths, 
        fallback: 'blocking'
    }
    //include parentheses --> instantly returning an object from a function 
}

export const getStaticProps = async ({params: { slug }}) => {
    
    const query = `*[_type == "product" && slug.current ==  '${slug}'][0]`;
    const productsQuery = "*[_type == 'product']"
    
    const product = await client.fetch(query)
    const products = await client.fetch(productsQuery)

    return {
      props: {products, product}
    }
  }


export default ProductDetails