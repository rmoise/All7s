import { Handler } from '@netlify/functions'

export const handler: Handler = async (event) => {
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

    // Submit directly to Netlify Forms
    const response = await fetch('/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Netlify-Original-Path': '/',
        'X-Netlify-Form-Name': 'newsletter',
        'X-Netlify-Site': process.env.SITE_ID || '',
        'X-Netlify-Form': 'true',
      },
      body: new URLSearchParams({
        'form-name': 'newsletter',
        'email': email,
        'bot-field': '',
      }).toString()
    });

    console.log('Netlify Forms response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Form submission failed:', text);
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
    console.error('Form submission error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
