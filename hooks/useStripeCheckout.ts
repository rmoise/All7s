import { useState } from 'react'
import getStripe from '../lib/getStripe'
import toast from 'react-hot-toast'

interface CheckoutItem {
  price_data: {
    currency: string
    product_data: {
      name: string
      images: string[]
    }
    unit_amount: number
  }
  quantity: number
}

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false)

  const redirectToCheckout = async (lineItems: CheckoutItem[]) => {
    try {
      setIsLoading(true)

      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')) {
        throw new Error('Invalid Stripe configuration')
      }

      const apiUrl = process.env.NEXT_PUBLIC_CHECKOUT_API_URL || '/api/checkout'

      console.log('Initiating checkout request:', {
        url: apiUrl,
        env: process.env.NODE_ENV,
        port: window.location.port,
        itemCount: lineItems.length,
        totalAmount: lineItems.reduce((sum, item) =>
          sum + (item.price_data.unit_amount * item.quantity), 0) / 100
      })

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ line_items: lineItems }),
        cache: 'no-store',
      })

      console.log('Checkout API response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      })

      let responseText
      try {
        responseText = await response.text()
        console.log('Raw response body:', responseText)
      } catch (textError) {
        console.error('Failed to read response text:', textError)
        throw new Error('Failed to read API response')
      }

      let data
      try {
        data = responseText ? JSON.parse(responseText) : null
        console.log('Parsed response data:', data)
      } catch (parseError: any) {
        console.error('Failed to parse response:', {
          text: responseText,
          error: parseError.message
        })
        throw new Error(`Invalid API response format: ${parseError.message}`)
      }

      if (!response.ok || !data) {
        const errorDetails = {
          status: response.status,
          statusText: response.statusText,
          error: data?.error,
          data
        }
        console.error('Checkout API error:', errorDetails)
        throw new Error(data?.error || `Checkout failed: ${response.status} ${response.statusText}`)
      }

      if (!data.sessionId) {
        console.error('Missing session ID in response:', data)
        throw new Error('No session ID returned from checkout API')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Failed to initialize Stripe')
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (result.error) {
        console.error('Stripe redirect error:', result.error)
        throw result.error
      }

    } catch (error: any) {
      console.error('Checkout process failed:', {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    redirectToCheckout,
    isLoading,
  }
}
