import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  console.log('Form submission event:', {
    httpMethod: event.httpMethod,
    headers: event.headers,
    body: event.body,
    path: event.path
  });

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  try {
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No form data provided' }) }
    }

    const formData = new URLSearchParams(event.body);
    const email = formData.get('email') || '';

    // Check if we're in development
    const isDevelopment = process.env.CONTEXT === 'dev' || event.headers['x-nf-deploy-context'] === 'dev';

    if (isDevelopment) {
      // In development, just return success without trying to submit to Netlify Forms
      console.log('Development mode - skipping Netlify Forms submission');
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Form received (development mode)',
          email: email
        })
      }
    }

    // Production: Submit to Netlify Forms
    const response = await fetch(process.env.URL + '/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Netlify-Original-Path': '/',
        'X-Netlify-Form-Name': 'newsletter',
        'X-Netlify-Site': process.env.SITE_ID || '',
        'X-Netlify-Form': 'true',
        'X-Netlify-Form-Version': '2',
      },
      body: new URLSearchParams({
        'form-name': 'newsletter',
        'email': email,
        'bot-field': '',
      }).toString()
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error('Netlify form submission failed:', responseText);
      throw new Error(`Failed to submit to Netlify Forms: ${response.status}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Form submitted successfully',
        email: email
      })
    }
  } catch (error) {
    console.error('Form submission error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
