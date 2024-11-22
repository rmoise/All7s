'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import type { CartContextType, CartItem } from '../types/cart';
import { AiOutlineShopping } from 'react-icons/ai';

const Context = createContext<CartContextType | undefined>(undefined);

export const StateContext: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        console.log('Initial cart load from storage:', parsedCart); // Debug log
        return parsedCart;
      }
    }
    return [];
  });

  const [totalPrice, setTotalPrice] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedPrice = localStorage.getItem('totalPrice');
      return savedPrice ? Number(savedPrice) : 0;
    }
    return 0;
  });

  const [totalQuantities, setTotalQuantities] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedQuantities = localStorage.getItem('totalQuantities');
      return savedQuantities ? Number(savedQuantities) : 0;
    }
    return 0;
  });

  const [cartCheck, setCartCheck] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCartCheck = localStorage.getItem('cartCheck');
      return savedCartCheck ? JSON.parse(savedCartCheck) : [];
    }
    return [];
  });

  const [qty, setQty] = useState(1);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      setMobile(true);
    }
  }, []);

  // Only sync to localStorage when cartItems change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (cartItems.length > 0) {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        localStorage.setItem('totalPrice', String(totalPrice));
        localStorage.setItem('totalQuantities', String(totalQuantities));
        localStorage.setItem('cartCheck', JSON.stringify(cartCheck));
      } else {
        // Only clear localStorage, don't update state
        localStorage.removeItem('cartItems');
        localStorage.removeItem('totalPrice');
        localStorage.removeItem('totalQuantities');
        localStorage.removeItem('cartCheck');
      }
    }
  }, [cartItems, totalPrice, totalQuantities, cartCheck]);

  // Initialize state from localStorage on mount only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCartItems = localStorage.getItem('cartItems');
      const storedTotalPrice = localStorage.getItem('totalPrice');
      const storedTotalQuantities = localStorage.getItem('totalQuantities');
      const storedCartCheck = localStorage.getItem('cartCheck');

      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
        setTotalPrice(Number(storedTotalPrice));
        setTotalQuantities(Number(storedTotalQuantities));
        setCartCheck(JSON.parse(storedCartCheck || '[]'));
      }
    }
  }, []); // Empty dependency array = only runs once on mount

  const incQty = () => {
    setQty((prevQty) => prevQty + 1);
  };

  const decQty = () => {
    setQty((prevQty) => (prevQty > 1 ? prevQty - 1 : 1));
  };

  const onAdd = (product: CartItem, quantity: number) => {
    const existingProduct = cartItems.find((item) => item._id === product._id);

    if (existingProduct) {
      const updatedCartItems = cartItems.map((cartItem) =>
        cartItem._id === product._id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      );

      setCartItems(updatedCartItems);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + (product.price * quantity));
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);
      toast.success(`${product.name} quantity updated in cart`);
    } else {
      setCartItems([...cartItems, { ...product, quantity }]);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + (product.price * quantity));
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const toggleCartItemQuantity = (id: string, value: 'inc' | 'dec') => {
    const foundProduct = cartItems.find((item) => item._id === id);
    const index = cartItems.findIndex((product) => product._id === id);

    if (!foundProduct) return;

    const newCartItems = [...cartItems];

    if (value === 'inc') {
      newCartItems[index] = { ...foundProduct, quantity: foundProduct.quantity + 1 };
      setCartItems(newCartItems);
      setTotalPrice((prevTotalPrice) => prevTotalPrice + foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities + 1);
    } else if (value === 'dec') {
      const newQuantity = foundProduct.quantity - 1;
      newCartItems[index] = { ...foundProduct, quantity: newQuantity };
      setCartItems(newCartItems);
      setTotalPrice((prevTotalPrice) => prevTotalPrice - foundProduct.price);
      setTotalQuantities((prevTotalQuantities) => prevTotalQuantities - 1);
    }
  };

  const updateCartItemQuantity = (id: string, newQuantity: number) => {
    const foundProduct = cartItems.find((item) => item._id === id);
    if (!foundProduct) return;

    const quantityDiff = newQuantity - foundProduct.quantity;
    const priceDiff = quantityDiff * foundProduct.price;

    const newCartItems = cartItems.map(cartItem =>
      cartItem._id === id
        ? { ...cartItem, quantity: newQuantity }
        : cartItem
    );

    setCartItems(newCartItems);
    setTotalPrice(prev => prev + priceDiff);
    setTotalQuantities(prev => prev + quantityDiff);
  };

  const onRemove = (product: CartItem) => {
    const foundProduct = cartItems.find((item) => item._id === product._id);
    if (!foundProduct) return;

    const newCartItems = cartItems.filter((item) => item._id !== product._id);

    // Update all related state immediately
    setCartItems(newCartItems);
    setTotalPrice(prev => prev - foundProduct.price * foundProduct.quantity);
    setTotalQuantities(prev => prev - foundProduct.quantity);
    setCartCheck(prev => prev.filter(id => id !== product._id));
  };

  return (
    <Context.Provider
      value={{
        showCart,
        setShowCart,
        cartItems,
        setCartItems,
        totalPrice,
        setTotalPrice,
        totalQuantities,
        setTotalQuantities,
        qty,
        setQty,
        incQty,
        decQty,
        onAdd,
        toggleCartItemQuantity,
        onRemove,
        cartCheck,
        setCartCheck,
        mobile,
        setMobile,
        updateCartItemQuantity
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateContext provider');
  }
  return context;
};

const CartIcon = () => {
  const { totalQuantities } = useStateContext();

  return (
    <div className="relative">
      <AiOutlineShopping size={25} />
      {totalQuantities > 0 && (
        <span className={`absolute -top-2 -right-2 bg-red-500 text-white rounded-full
          ${totalQuantities > 9 ? 'w-6 h-6 text-xs' : 'w-5 h-5 text-sm'}
          flex items-center justify-center font-medium`}>
          {totalQuantities}
        </span>
      )}
    </div>
  );
};
