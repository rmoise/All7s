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

      console.log('Starting checkout process:', {
        itemCount: lineItems.length,
        totalAmount: lineItems.reduce((sum, item) => sum + (item.price_data.unit_amount * item.quantity), 0) / 100
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items: lineItems }),
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