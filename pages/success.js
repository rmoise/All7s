import React, {useState, useEffect} from 'react'
import Link from 'next/link'
import {BsBagCheckFill} from 'react-icons/bs'
import { useRouter } from 'next/router';
import { useStateContext } from '../context/StateContext'
import { runSnow } from '../lib/utils';

const Success = () => {
    const {setCartItems, setTotalPrice, setTotalQuantities} = useStateContext()
    useEffect(() => {
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);
    runSnow()
   },[])

  return (
    <div className="success-wrapper">
        <div className="success">
            <p className="icon">
                <BsBagCheckFill/>
            </p>
            <h2>
                THANK YOU FOR YOUR ORDER
            </h2>
            <p className="email-msg">CHECK YOUR EMAIL FOR ORDER CONFIRMATION</p>
            <p className="description">IF YOU HAVE ANY QUESTIONS, PLEASE EMAIL
                 <a className="email" href="mailto:stz787@gmail.com">ALL7Z</a>  

                 <Link href='/shop'>
                    <button type="button" width="300px" className="btn">CONTINUE SHOPPING</button>
                </Link>
             </p>
        </div>
    </div>

  )
}

export default Success