import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { stripeCountryObjs } from '../stripe/countries'

const stripeCountryCodes = stripeCountryObjs.map(
  (country) =>
    country.code as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry
)

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    console.log('API Route: Checkout request received:', {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
    })

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('API Route: Missing Stripe configuration')
      return NextResponse.json(
        { error: 'Missing Stripe configuration' },
        { status: 500 }
      )
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const body = await request.json()
    console.log('API Route: Request body:', { body })

    const { line_items } = body

    if (!Array.isArray(line_items) || line_items.length === 0) {
      console.error('API Route: Invalid line items:', { line_items })
      return NextResponse.json({ error: 'Invalid line items' }, { status: 400 })
    }

    const origin =
      (await headersList.get('origin')) ||
      (await headersList.get('referer')) ||
      'https://all7z.com'

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/shop`,
        payment_method_types: ['card'],
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: stripeCountryCodes,
        },
      })

      console.log('API Route: Session created:', { sessionId: session.id })
      return NextResponse.json({ sessionId: session.id })
    } catch (stripeError: any) {
      console.error('API Route: Stripe error:', stripeError)
      return NextResponse.json(
        { error: stripeError.message },
        { status: stripeError.statusCode || 500 }
      )
    }
  } catch (error: any) {
    console.error('API Route: General error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
