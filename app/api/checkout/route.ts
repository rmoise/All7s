import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripeCountryObjs } from '../stripe/countries';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia',
});

const stripeCountryCodes = stripeCountryObjs.map(country =>
  country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
);

export async function POST(request: Request) {
  try {
    const { line_items } = await request.json();

    if (!line_items || !Array.isArray(line_items)) {
      console.error('Invalid line items:', line_items);
      return NextResponse.json(
        { message: 'Invalid line items provided', details: line_items },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key');
      return NextResponse.json(
        { message: 'Stripe configuration error' },
        { status: 500 }
      );
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
    console.error('Stripe API error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      statusCode: error.statusCode,
      raw: error
    });

    return NextResponse.json(
      {
        message: error.message || 'Error creating checkout session',
        type: error.type,
        code: error.code,
        param: error.param,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: error.statusCode || 500 }
    );
  }
}