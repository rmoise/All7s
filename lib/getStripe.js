import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = async () => {
  try {
    if (!stripePromise) {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!key) {
        console.error('Stripe key missing');
        throw new Error('Stripe publishable key is not set');
      }
      console.log('Stripe key prefix:', key.substring(0, 7));
      stripePromise = loadStripe(key);
    }
    return stripePromise;
  } catch (error) {
    console.error('Stripe initialization error:', error);
    throw error;
  }
};

export default getStripe;