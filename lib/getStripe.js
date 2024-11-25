import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = async () => {
  try {
    if (!stripePromise) {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!key) {
        throw new Error('Stripe publishable key is not set');
      }

      const options = {
        stripeAccount: process.env.NEXT_PUBLIC_STRIPE_ACCOUNT_ID,
        apiVersion: '2024-11-20.acacia',
        protocol: 'https',
      };

      stripePromise = loadStripe(key, options);
    }
    return stripePromise;
  } catch (error) {
    console.error('Stripe initialization error:', error);
    throw error;
  }
};

export default getStripe;