import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

const getStripe = async () => {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      throw new Error('Stripe publishable key is not set');
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

export default getStripe;