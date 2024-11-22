import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ line_items: lineItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Checkout failed');
      }

      const { sessionId } = await response.json();

      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
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