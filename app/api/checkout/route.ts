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
      timestamp: new Date().toISOString(),
      apiVersion: '2024-11-20.acacia',
      environment: process.env.NODE_ENV,
      mode: 'payment',
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7)
    });

    const { line_items } = await request.json();

    console.log('Request details:', {
      url: request.url,
      method: request.method,
      origin: request.headers.get('origin') ||
              request.headers.get('referer') ||
              'https://all7z.com',
      headers: Object.fromEntries(request.headers.entries())
    });

    console.log('Processing line items:', JSON.stringify(line_items, null, 2));

    if (!line_items || !Array.isArray(line_items)) {
      console.error('Invalid line items received:', line_items);
      return NextResponse.json(
        { message: 'Invalid line items provided' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') ||
                  request.headers.get('referer') ||
                  'https://all7z.com';

    console.log('Creating Stripe session with config:', {
      origin,
      itemCount: line_items.length,
      totalAmount: line_items.reduce((sum, item) =>
        sum + (item.price_data.unit_amount * item.quantity), 0)
    });

    const session = await stripe.checkout.sessions.create({
      submit_type: 'pay',
      mode: 'payment',
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: stripeCountryCodes,
      },
      line_items: line_items,
      success_url: `${origin}/shop?success=true`,
      cancel_url: `${origin}/shop?canceled=true`,
    });

    console.log('Stripe session created successfully:', {
      sessionId: session.id,
      status: session.status,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Stripe checkout error:', {
      message: error.message,
      code: error.code,
      type: error.type,
      statusCode: error.statusCode,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      {
        error: error.message || 'Checkout failed',
        code: error.code,
        type: error.type
      },
      { status: error.statusCode || 500 }
    );
  }
}