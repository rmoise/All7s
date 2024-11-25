'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  AiOutlineMinus,
  AiOutlinePlus,
  AiOutlineLeft,
  AiOutlineShopping,
} from 'react-icons/ai'
import { TiDeleteOutline } from 'react-icons/ti'
import toast from 'react-hot-toast'
import { useStateContext } from '../../context/StateContext'
import { urlFor } from '@lib/sanity'
import { useRouter } from 'next/navigation'
import getStripe from '../../lib/getStripe'
import type { CartItem } from '../../types/cart'
import { motion, AnimatePresence } from 'framer-motion'

const Cart: React.FC = () => {
  const cartRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
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
    updateCartItemQuantity,
  } = useStateContext()

  const [itemsToRemove, setItemsToRemove] = useState<Set<string>>(new Set())
  const [inputValues, setInputValues] = useState<{ [key: string]: string }>({})
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const checkoutHandledRef = useRef(false)

  // Memoized handlers
  const handleQuantityInput = useCallback((item: CartItem, value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value))
    const prevQuantity = parseInt(inputValues[item._id] ?? item.quantity.toString())

    setInputValues(prev => ({
      ...prev,
      [item._id]: numValue.toString()
    }))

    if (numValue === 0) {
      setItemsToRemove(prev => new Set(prev).add(item._id))
      updateCartItemQuantity(item._id, 0)
    } else {
      setItemsToRemove(prev => {
        const newSet = new Set(prev)
        newSet.delete(item._id)
        return newSet
      })
      updateCartItemQuantity(item._id, numValue)
    }

    // Recalculate totals based on all cart items
    const updatedTotalPrice = cartItems.reduce((total, cartItem) => {
      if (cartItem._id === item._id) {
        return total + (cartItem.price * numValue)
      }
      return total + (cartItem.price * cartItem.quantity)
    }, 0)

    const updatedTotalQuantities = cartItems.reduce((total, cartItem) => {
      if (cartItem._id === item._id) {
        return total + numValue
      }
      return total + cartItem.quantity
    }, 0)

    setTotalPrice(updatedTotalPrice)
    setTotalQuantities(updatedTotalQuantities)
  }, [cartItems, updateCartItemQuantity, inputValues, setTotalPrice, setTotalQuantities])

  const handleQuantityChange = useCallback((id: string, action: 'inc' | 'dec') => {
    const item = cartItems.find(item => item._id === id)
    if (!item) return

    const currentValue = parseInt(inputValues[id] ?? item.quantity.toString())

    if (action === 'dec') {
      if (currentValue <= 1) {
        handleQuantityInput(item, '0')
        setItemsToRemove(prev => new Set(prev).add(id))
        return
      }
      handleQuantityInput(item, Math.max(0, currentValue - 1).toString())
    } else {
      if (itemsToRemove.has(id)) {
        setItemsToRemove(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
        handleQuantityInput(item, '1')
        return
      }
      handleQuantityInput(item, (currentValue + 1).toString())
    }
  }, [cartItems, itemsToRemove, handleQuantityInput, inputValues])

  // Add this function to handle product removal
  const handleRemoveProduct = useCallback((item: CartItem) => {
    onRemove(item)

    // Recalculate totals after removing item
    const remainingItems = cartItems.filter(cartItem => cartItem._id !== item._id)
    const updatedTotalPrice = remainingItems.reduce((total, cartItem) =>
      total + (cartItem.price * cartItem.quantity), 0
    )
    const updatedTotalQuantities = remainingItems.reduce((total, cartItem) =>
      total + cartItem.quantity, 0
    )

    setTotalPrice(updatedTotalPrice)
    setTotalQuantities(updatedTotalQuantities)

    // Clean up input values and remove from itemsToRemove
    setInputValues(prev => {
      const newValues = { ...prev }
      delete newValues[item._id]
      return newValues
    })
    setItemsToRemove(prev => {
      const newSet = new Set(prev)
      newSet.delete(item._id)
      return newSet
    })
  }, [cartItems, onRemove, setTotalPrice, setTotalQuantities])

  // Optimized effects
  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = 'hidden'

      const handleClickOutside = (event: MouseEvent) => {
        if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
          setShowCart(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.body.style.overflow = 'unset'
      }
    }
  }, [showCart, setShowCart])

  // Prefetch product pages
  useEffect(() => {
    const prefetchTimeout = setTimeout(() => {
      cartItems.forEach(item => {
        const slugValue = typeof item.slug === 'string' ? item.slug : item.slug?.current
        if (slugValue) {
          router.prefetch(`/shop/${slugValue}`)
        }
      })
    }, 1000) // Delay prefetch to avoid unnecessary requests

    return () => clearTimeout(prefetchTimeout)
  }, [cartItems, router])

  const handleCheckout = async () => {
    try {
      console.log('Browser environment:', {
        userAgent: window.navigator.userAgent,
        language: window.navigator.language,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      });

      console.log('Stripe initialization:', {
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        keyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7),
        environment: process.env.NODE_ENV
      });

      if (!cartItems?.length) {
        console.log('Checkout attempted with empty cart');
        toast.error('Your cart is empty')
        return
      }

      setIsCheckoutLoading(true)
      console.log('Starting checkout process:', {
        itemCount: cartItems.length,
        totalAmount: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      });

      const line_items = cartItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image?.map((img) => urlFor(img).url()).filter(Boolean) || [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }))

      console.log('Prepared line items:', JSON.stringify(line_items, null, 2));

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items }),
      })

      console.log('Checkout API response:', {
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });

      const data = await response.json()
      console.log('Checkout API data:', data);

      if (!response.ok) {
        throw new Error(data.message || `Checkout failed: ${response.status}`)
      }

      if (!data.sessionId) {
        console.error('Missing session ID in response:', data);
        throw new Error('No session ID returned from checkout API')
      }

      console.log('Initializing Stripe redirect with session:', data.sessionId);
      const stripe = await getStripe()

      if (!stripe) {
        console.error('Failed to initialize Stripe');
        throw new Error('Failed to load Stripe')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      })

      if (error) {
        console.error('Stripe redirect error:', {
          message: error.message,
          type: error.type,
          code: error.code,
          timestamp: new Date().toISOString()
        });
        throw error
      }

    } catch (error: any) {
      console.error('Checkout process failed:', {
        name: error.name,
        message: error.message,
        status: error.status,
        stack: error.stack,
        response: error.response?.data,
        timestamp: new Date().toISOString()
      });

      let errorMessage = 'Something went wrong with checkout'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
    } finally {
      setIsCheckoutLoading(false)
    }
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search)
    const isSuccess = query.get('success')
    const isCanceled = query.get('canceled')

    if (!isSuccess && !isCanceled) return
    if (checkoutHandledRef.current) return

    const handleCheckoutResult = () => {
      if (isSuccess === 'true') {
        checkoutHandledRef.current = true
        setCartItems([])
        setTotalPrice(0)
        setTotalQuantities(0)
        toast.success('Payment successful! Thank you for your purchase.')
      } else if (isCanceled === 'true') {
        checkoutHandledRef.current = true
        toast.error('Payment canceled. Your cart items are still saved.')
      }

      const previousPath = sessionStorage.getItem('previousPath') || '/'
      sessionStorage.removeItem('previousPath')
      router.replace(previousPath)
    }

    handleCheckoutResult()
  }, [router, setCartItems, setTotalPrice, setTotalQuantities])

  const handleProductClick = (e: React.MouseEvent, item: CartItem) => {
    e.preventDefault()
    e.stopPropagation()

    const slugValue =
      typeof item.slug === 'string' ? item.slug : item.slug?.current
    if (slugValue) {
      setShowCart(false)
      router.push(`/shop/${slugValue}`)
    }
  }

  const handleClose = () => {
    setShowCart(false)
  }

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
            ref={cartRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white z-50 flex flex-col"
          >
            <header className="sticky top-0 bg-white p-6 border-b">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="flex items-center space-x-2"
                  onClick={() => setShowCart(false)}
                >
                  <AiOutlineLeft className="text-black text-2xl" />
                  <span className="text-black font-semibold">YOUR CART</span>
                </button>
                <span className="text-black">
                  ({totalQuantities} items)
                </span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems?.length < 1 ? (
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <AiOutlineShopping size={150} className="text-gray-300" />
                  <h3 className="text-black text-xl font-semibold mt-4">
                    YOUR SHOPPING BAG IS EMPTY
                  </h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-24">
                  {cartItems.map((item: CartItem) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-50 rounded-lg p-4 relative cursor-pointer"
                      onClick={(e) => handleProductClick(e, item)}
                    >
                      <button
                        type="button"
                        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveProduct(item)
                        }}
                      >
                        <TiDeleteOutline size={20} />
                      </button>
                      <img
                        src={
                          item?.image?.[0]
                            ? urlFor(item.image[0]).url()
                            : '/images/placeholder.png'
                        }
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-md"
                      />
                      <div className="mt-3">
                        <h3 className="text-black font-medium truncate">
                          {item.name}
                        </h3>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-black font-semibold">
                            ${item.price}
                          </span>
                          <div
                            className="flex items-center space-x-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {itemsToRemove.has(item._id) ? (
                              <>
                                <button
                                  onClick={() => handleRemoveProduct(item)}
                                  className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                                  title="Remove item"
                                >
                                  <AiOutlineMinus size={12} />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={inputValues[item._id] ?? item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || parseInt(value) >= 0) {
                                      handleQuantityInput(item, value)
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value
                                    const numValue = parseInt(value)

                                    if (!value || isNaN(numValue) || numValue <= 0) {
                                      handleQuantityInput(item, '1')
                                      setItemsToRemove(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(item._id)
                                        return newSet
                                      })
                                    }
                                  }}
                                  className={`w-14 h-6 text-center bg-transparent ${
                                    itemsToRemove.has(item._id) ? 'text-red-500' : 'text-black'
                                  } border border-gray-200 rounded px-1
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                                <button
                                  onClick={() => {
                                    setItemsToRemove((prev) => {
                                      const newSet = new Set(prev)
                                      newSet.delete(item._id)
                                      return newSet
                                    })
                                    handleQuantityInput(item, '1')
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
                                    const currentValue =
                                      inputValues[item._id] ?? item.quantity
                                    if (
                                      currentValue === '' ||
                                      currentValue === '0'
                                    ) {
                                      handleRemoveProduct(item)
                                    } else {
                                      handleQuantityChange(item._id, 'dec')
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                >
                                  <AiOutlineMinus size={12} />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={inputValues[item._id] ?? item.quantity}
                                  onChange={(e) => {
                                    const value = e.target.value
                                    if (value === '' || parseInt(value) >= 0) {
                                      handleQuantityInput(item, value)
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const value = e.target.value
                                    const numValue = parseInt(value)

                                    if (!value || isNaN(numValue) || numValue <= 0) {
                                      handleQuantityInput(item, '1')
                                      setItemsToRemove(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(item._id)
                                        return newSet
                                      })
                                    }
                                  }}
                                  className={`w-14 h-6 text-center bg-transparent ${
                                    itemsToRemove.has(item._id) ? 'text-red-500' : 'text-black'
                                  } border border-gray-200 rounded px-1
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                                />
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item._id, 'inc')
                                  }
                                  className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors duration-200"
                                >
                                  <AiOutlinePlus size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {cartItems?.length > 0 && (
              <div className="sticky bottom-0 right-0 w-full bg-white p-6 border-t mt-auto">
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
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Cart
