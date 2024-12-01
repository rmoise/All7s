import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { stripeCountryObjs } from '../stripe/countries';

const stripeCountryCodes = stripeCountryObjs.map(country =>
  country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
);

export async function POST(request: Request) {
  try {
    console.log('Checkout request received:', {
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin'),
      referer: request.headers.get('referer')
    });

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Missing Stripe secret key' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });

    const { line_items } = await request.json();

    if (!Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid line items' },
        { status: 400 }
      );
    }

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
      },
      metadata: {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
        origin: origin,
        total_amount: line_items.reduce((sum: number, item: any) =>
          sum + (item.price_data.unit_amount * item.quantity), 0
        ),
        items_count: line_items.length
      }
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      amount: session.amount_total,
      currency: session.currency,
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
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: error.message || 'Checkout failed' },
      { status: error.statusCode || 500 }
    );
  }
}