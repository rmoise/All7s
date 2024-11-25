import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripeCountryObjs } from '../stripe/countries';

const stripeCountryCodes = stripeCountryObjs.map(country =>
  country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
);

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret key');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    const { line_items } = await request.json();

    const origin = request.headers.get('origin') ||
                  request.headers.get('referer') ||
                  'https://all7z.com';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/shop`,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: stripeCountryCodes
      }
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe checkout error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: error.statusCode || 500 }
    );
  }
}