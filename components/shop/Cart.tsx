'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineLeft, AiOutlineShopping } from 'react-icons/ai';
import { TiDeleteOutline } from 'react-icons/ti';
import toast from 'react-hot-toast';
import { useStateContext } from '../../context/StateContext';
import { urlFor } from '@lib/sanity';
import { useRouter } from 'next/navigation';
import getStripe from '../../lib/getStripe';
import type { CartItem } from '../../types/cart';
import { motion, AnimatePresence } from 'framer-motion';

const Cart: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    totalPrice,
    totalQuantities,
    cartItems,
    showCart,
    setShowCart,
    toggleCartItemQuantity,
    onRemove,
    setCartItems,
    setTotalPrice,
    setTotalQuantities,
    updateCartItemQuantity
  } = useStateContext();
  const [itemsToRemove, setItemsToRemove] = useState<Set<string>>(new Set());
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({});
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const checkoutHandledRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCart]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setShowCart(false);
      }
    };

    if (showCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCart, setShowCart]);

  useEffect(() => {
    const handleRouteChange = () => {
      setShowCart(false);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [setShowCart]);

  const handleCheckout = async () => {
    try {
      if (!cartItems?.length) {
        toast.error('Your cart is empty');
        return;
      }

      setIsCheckoutLoading(true);

      const line_items = cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image?.map(img => urlFor(img).url()).filter(Boolean) || [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity
      }));

      console.log('Sending line items:', JSON.stringify(line_items, null, 2));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Checkout failed: ${response.status}`);
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned from checkout API');
      }

      sessionStorage.setItem('previousPath', window.location.pathname);

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        console.error('Stripe redirect error:', error);
        throw new Error(error.message || 'Failed to redirect to checkout');
      }

    } catch (error: any) {
      console.error('Full checkout error:', {
        name: error.name,
        message: error.message,
        status: error.status,
        stack: error.stack,
        response: error.response?.data,
        details: error
      });

      let errorMessage = 'Something went wrong with checkout';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const isSuccess = query.get('success');
    const isCanceled = query.get('canceled');

    if (!isSuccess && !isCanceled) return;
    if (checkoutHandledRef.current) return;

    const handleCheckoutResult = () => {
      if (isSuccess === 'true') {
        checkoutHandledRef.current = true;
        setCartItems([]);
        setTotalPrice(0);
        setTotalQuantities(0);
        toast.success('Payment successful! Thank you for your purchase.');
      } else if (isCanceled === 'true') {
        checkoutHandledRef.current = true;
        toast.error('Payment canceled. Your cart items are still saved.');
      }

      const previousPath = sessionStorage.getItem('previousPath') || '/';
      sessionStorage.removeItem('previousPath');
      router.replace(previousPath);
    };

    handleCheckoutResult();
  }, [router, setCartItems, setTotalPrice, setTotalQuantities]);

  const handleQuantityChange = (id: string, action: 'inc' | 'dec') => {
    const item = cartItems.find(item => item._id === id);
    if (!item) return;

    if (action === 'dec' && item.quantity === 1) {
      handleQuantityInput(item, '0');
      setItemsToRemove(prev => new Set(prev).add(id));
      return;
    }

    if (action === 'inc' && itemsToRemove.has(id)) {
      setItemsToRemove(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      handleQuantityInput(item, '1');
      return;
    }

    toggleCartItemQuantity(id, action);
  };

  const handleProductClick = async (e: React.MouseEvent, item: CartItem) => {
    e.preventDefault();
    e.stopPropagation();

    // Handle both string and object slug types
    const slugValue = typeof item.slug === 'string' ? item.slug : item.slug?.current;

    if (slugValue) {
      try {
        setShowCart(false);
        await router.push(`/shop/${slugValue}`);
      } catch (err: unknown) {
        console.error('Navigation error:', err);
        window.location.href = `/shop/${slugValue}`;
      }
    } else {
      console.warn('Missing slug data for item:', item);
    }
  };

  const handleQuantityInput = (item: CartItem, value: string) => {
    // Update the input value state
    setInputValues(prev => ({
      ...prev,
      [item._id]: value
    }));

    // Convert to number for cart updates
    const numValue = value === '' ? 0 : parseInt(value);

    if (numValue === 0) {
      setItemsToRemove(prev => new Set(prev).add(item._id));
      // Update cart item quantity to 0 using the context function
      updateCartItemQuantity(item._id, 0);
    } else if (!isNaN(numValue) && numValue > 0) {
      updateCartItemQuantity(item._id, numValue);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {showCart && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCart(false)}
            className="fixed inset-0 bg-black z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white z-50 p-6 overflow-y-auto"
            ref={cartRef}
          >
            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                className="flex items-center space-x-2"
                onClick={() => setShowCart(false)}
              >
                <AiOutlineLeft className="text-black text-2xl" />
                <span className="text-black font-semibold">YOUR CART</span>
              </button>
              <span className="text-black" suppressHydrationWarning>
                ({totalQuantities} items)
              </span>
            </div>

            {cartItems?.length < 1 ? (
              <div className="flex flex-col items-center justify-center h-[60vh]">
                <AiOutlineShopping size={150} className="text-gray-300" />
                <h3 className="text-black text-xl font-semibold mt-4">YOUR SHOPPING BAG IS EMPTY</h3>
                <Link href="/shop">
                  <button
                    type="button"
                    onClick={() => setShowCart(false)}
                    className="mt-6 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800"
                  >
                    CONTINUE SHOPPING
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {cartItems.map((item: CartItem) => (
                    <div
                      key={item._id}
                      className="bg-gray-50 rounded-lg p-4 relative cursor-pointer"
                      onClick={(e) => handleProductClick(e, item)}
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(item);
                        }}
                      >
                        <TiDeleteOutline size={20} />
                      </button>
                      <img
                        src={item?.image?.[0] ? urlFor(item.image[0]).url() : '/images/placeholder.png'}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <div className="mt-3">
                        <h3 className="text-black font-medium truncate">{item.name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-black font-semibold">${item.price}</span>
                          <div
                            className="flex items-center space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {itemsToRemove.has(item._id) ? (
                              <>
                                <button
                                  onClick={() => onRemove(item)}
                                  className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                  title="Remove item"
                                >
                                  <AiOutlineMinus size={12} />
                                </button>
                                <input
                                  type="number"
                                  value={inputValues[item._id] ?? item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleQuantityInput(item, value);
                                  }}
                                  onBlur={(e) => {
                                    // Only reset to 1 if we're not about to remove the item
                                    const value = e.target.value;
                                    const numValue = parseInt(value);
                                    if ((!value || isNaN(numValue)) && !itemsToRemove.has(item._id)) {
                                      handleQuantityInput(item, '1');
                                      setItemsToRemove(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(item._id);
                                        return newSet;
                                      });
                                    }
                                  }}
                                  className={`w-14 h-6 text-center bg-transparent ${
                                    itemsToRemove.has(item._id) ? 'text-red-500' : 'text-black'
                                  } border border-gray-200 rounded px-1
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                                <button
                                  onClick={() => {
                                    setItemsToRemove(prev => {
                                      const newSet = new Set(prev);
                                      newSet.delete(item._id);
                                      return newSet;
                                    });
                                    handleQuantityInput(item, '1');
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                  title="Keep item"
                                >
                                  <AiOutlinePlus size={12} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    const currentValue = inputValues[item._id] ?? item.quantity;
                                    if (currentValue === '' || currentValue === '0') {
                                      onRemove(item);
                                    } else {
                                      handleQuantityChange(item._id, 'dec');
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                >
                                  <AiOutlineMinus size={12} />
                                </button>
                                <input
                                  type="number"
                                  value={inputValues[item._id] ?? item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    handleQuantityInput(item, value);
                                  }}
                                  onBlur={(e) => {
                                    // Only reset to 1 if we're not about to remove the item
                                    const value = e.target.value;
                                    const numValue = parseInt(value);
                                    if ((!value || isNaN(numValue)) && !itemsToRemove.has(item._id)) {
                                      handleQuantityInput(item, '1');
                                      setItemsToRemove(prev => {
                                        const newSet = new Set(prev);
                                        newSet.delete(item._id);
                                        return newSet;
                                      });
                                    }
                                  }}
                                  className={`w-14 h-6 text-center bg-transparent ${
                                    itemsToRemove.has(item._id) ? 'text-red-500' : 'text-black'
                                  } border border-gray-200 rounded px-1
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                                <button
                                  onClick={() => handleQuantityChange(item._id, 'inc')}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                >
                                  <AiOutlinePlus size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="fixed bottom-0 right-0 w-full md:w-[600px] bg-white p-6 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-black font-semibold">Subtotal:</h3>
                    <h3 className="text-black font-semibold">${totalPrice}</h3>
                  </div>
                  <button
                    type="button"
                    className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:opacity-50"
                    onClick={handleCheckout}
                    disabled={isCheckoutLoading}
                  >
                    {isCheckoutLoading ? 'Processing...' : 'Check Out'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;
