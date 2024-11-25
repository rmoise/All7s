import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripeCountryObjs } from '../stripe/countries';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

const stripeCountryCodes = stripeCountryObjs.map(country =>
  country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
);

export async function POST(request: Request) {
  try {
    console.log('Stripe configuration:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7),
      environment: process.env.NODE_ENV
    });

    const { line_items } = await request.json();

    if (!line_items || !Array.isArray(line_items)) {
      console.error('Invalid line items:', line_items);
      return NextResponse.json(
        { message: 'Invalid line items provided', details: line_items },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Missing Stripe secret key');
    }

    console.log('Creating Stripe session with line items:', JSON.stringify(line_items, null, 2));
    const origin = request.headers.get('origin') || request.headers.get('referer') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: stripeCountryCodes,
      },
      line_items: line_items,
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    console.log('Stripe session created:', session.id);
    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe checkout error:', {
      message: error.message,
      type: error.type,
      stack: error.stack,
      env: process.env.NODE_ENV
    });

    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: error.statusCode || 500 }
    );
  }
}