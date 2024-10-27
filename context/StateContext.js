import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const Context = createContext();

export const StateContext = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalQuantities, setTotalQuantities] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartCheck, setCartCheck] = useState([]);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setMobile(true);
    }
  }, []);

  // Increment quantity function
  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  // Decrement quantity function with a minimum limit of 1
  const decQty = () => {
    setQty((prevQty) => (prevQty > 1 ? prevQty - 1 : 1));
  };

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        totalPrice,
        totalQuantities,
        qty,
        incQty, // Provide the function here
        decQty, // Provide the function here
        cartCheck,
        setCartCheck,
        mobile,
        setMobile,
        // Include other functions and states as needed
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => useContext(Context);
