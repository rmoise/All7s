import { Handler } from '@netlify/functions'
import Stripe from 'stripe'
import { stripeCountryCodes } from './lib/stripe-countries'

const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin':
      event.headers.origin || 'http://localhost:3001',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: '',
    }
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      }
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe configuration')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing Stripe configuration' }),
      }
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-02-24.acacia',
    })

    const body = JSON.parse(event.body || '{}')
    const { line_items } = body

    if (!Array.isArray(line_items) || line_items.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid line items' }),
      }
    }

    const origin =
      event.headers.origin || event.headers.referer || 'https://all7z.com'

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
    } as Stripe.Checkout.SessionCreateParams)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessionId: session.id }),
    }
  } catch (error: any) {
    console.error('Checkout function error:', error)
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export { handler }
