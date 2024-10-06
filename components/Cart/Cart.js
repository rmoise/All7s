import { useRef } from 'react'
import Link from 'next/link';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping} from 'react-icons/ai';
import { TiDeleteOutline } from 'react-icons/ti';
import toast from 'react-hot-toast';

import { useStateContext } from '../../context/StateContext'
import { urlFor } from '../../lib/client';
import getStripe from '../../lib/getStripe';

const Cart = () => {
const cartRef = useRef();
const { totalPrice, totalQuantities, cartItems, setShowCart, toggleCartItemQuantity, onRemove} = useStateContext();

const handleCheckout = async () => { 

    const stripe = await getStripe();
    const response = await fetch('/api/stripe', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization' : `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`
            },
            body: JSON.stringify(cartItems)
        })

        console.log(response)
        if (response.statusCode === 500) return;

        const data = await response.json();

        console.log('DATA', data);

        toast.loading('Redirecting to checkout...');

        stripe.redirectToCheckout({sessionId: data.id});
}

return(
<div className="cart-wrapper" ref={cartRef}>
    <div className="cart-container">
        <button 
            type="button"
            className="cart-heading"
            onClick={()=>setShowCart(false)}>
             <AiOutlineLeft className="text-black text-2xl"/>
             <span className="heading text-black">YOUR CART</span>
             <span className="cart-num-items">({ totalQuantities  } items)</span>
             
        </button>
        {cartItems?.length < 1 && (
            <div className="empty-cart">
                <AiOutlineShopping size={150}/>
                <h3 className="text-black">YOUR SHOPPING BAG IS EMPTY</h3>
                <Link href="/">
                    <button
                    type="button"
                    onClick={() => setShowCart(false)}
                    className="btn"
                    >CONTINUE SHOPPING</button>
                </Link>
            </div>
        )}
        <div className="product-container">
            {cartItems.length >= 1 && cartItems.map((item)=> {
                
                return (
                <div className="product" key={item._id}>
                    <img src={urlFor(item?.image[0])}
                         className="cart-product-image mt-12"/>
                    <div className="text-black">
                        <div className="flex flex-col">
                            <h5>{item.name}</h5>
                            <h4 className="mb-5">${item.price}</h4>
                            <div className="flex w-fit">
                                <div>
                                    <p className="w-fit">
                                        <p className="flex items-center gap-x-5 border">
                                            <span className="plus" onClick={()=>toggleCartItemQuantity(item._id, 'dec')}><AiOutlineMinus/></span>
                                            <span className="num">{item.quantity}</span>
                                            <span className="minus" onClick= {()=>toggleCartItemQuantity(item._id, 'inc')}><AiOutlinePlus/></span>
                                        </p>
                                    </p>
                                </div>
                                <button type="button"
                                className="remove-item"
                                onClick={()=>onRemove(item)}>
                                    <TiDeleteOutline className="ml-8"/>
                                </button>
                            </div>
                        </div>
                  </div>
                </div>
                )
            })}

        </div>
        {cartItems.length >=1 && (
        <div className="cart-bottom text-black">
            <div className="total">
            <h3>SUBTOTAL:</h3>
            <h3>${totalPrice}</h3>
            </div>
            <div className="btn-container">
                <button type="button" className="btn" onClick={handleCheckout}>CHECKOUT</button>
            </div>
        </div>
        )}
    </div>
</div>

    )
}

export default Cart