import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

const getStripe = async () => {
  try {
    if (!stripePromise) {
      const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

      console.log('Environment check:', {
        nodeEnv: process.env.NODE_ENV,
        hasStripeKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        keyType: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_') ? 'valid' : 'invalid',
        origin: typeof window !== 'undefined' ? window.location.origin : 'server'
      });

      if (!key || !key.startsWith('pk_')) {
        console.error('Invalid Stripe key:', {
          keyPrefix: key?.substring(0, 7),
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        });
        throw new Error('Invalid Stripe publishable key');
      }

      stripePromise = loadStripe(key);
    }

    const stripe = await stripePromise;

    if (!stripe) {
      console.error('Stripe initialization failed:', {
        timestamp: new Date().toISOString(),
        hasPromise: !!stripePromise,
        environment: process.env.NODE_ENV
      });
      throw new Error('Failed to initialize Stripe');
    }

    console.log('Stripe loaded successfully:', {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasStripeInstance: !!stripe,
      origin: typeof window !== 'undefined' ? window.location.origin : 'server'
    });

    return stripe;
  } catch (error: any) {
    console.error('Stripe initialization error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

export default getStripe;