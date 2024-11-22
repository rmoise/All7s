import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Validate request method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    // Check if body exists
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No form data provided' })
      }
    }

    // Parse the form data
    const data = new URLSearchParams(event.body)
    const email = data.get('email')

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      }
    }

    // Process the form submission
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Form submitted successfully',
        email: email
      })
    }
  } catch (error) {
    console.error('Form submission error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
