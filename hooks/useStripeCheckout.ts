import { useState } from 'react';
import getStripe from '../lib/getStripe';
import toast from 'react-hot-toast';

interface CheckoutItem {
  price_data: {
    currency: string;
    product_data: {
      name: string;
      images: string[];
    };
    unit_amount: number;
  };
  quantity: number;
}

export const useStripeCheckout = () => {
  const [isLoading, setIsLoading] = useState(false);

  const redirectToCheckout = async (lineItems: CheckoutItem[]) => {
    try {
      setIsLoading(true);

      // Verify Stripe key before proceeding
      if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_')) {
        console.error('Invalid Stripe configuration:', {
          keyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 7),
          environment: process.env.NODE_ENV
        });
        throw new Error('Invalid Stripe configuration');
      }

      const normalizedLineItems = lineItems.map(item => ({
        price_data: {
          currency: item.price_data.currency,
          product_data: {
            name: item.price_data.product_data.name,
            images: Array.isArray(item.price_data.product_data.images)
              ? item.price_data.product_data.images
              : [item.price_data.product_data.images]
          },
          unit_amount: Number(item.price_data.unit_amount)
        },
        quantity: Number(item.quantity)
      }));

      console.log('Starting checkout process:', {
        itemCount: normalizedLineItems.length,
        totalAmount: normalizedLineItems.reduce((sum, item) =>
          sum + (item.price_data.unit_amount * item.quantity), 0) / 100,
        items: normalizedLineItems
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items: normalizedLineItems }),
      });

      console.log('Checkout API response:', {
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString()
      });

      const data = await response.json();
      console.log('Checkout API data:', data);

      if (!response.ok) {
        throw new Error(data.error || `Checkout failed: ${response.status}`);
      }

      if (!data.sessionId) {
        throw new Error('No session ID returned from checkout API');
      }

      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Checkout process failed:', {
        message: error.message,
        code: error.code,
        type: error.type,
        timestamp: new Date().toISOString()
      });

      toast.error(error.message || 'Something went wrong with checkout');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    redirectToCheckout,
    isLoading,
  };
};