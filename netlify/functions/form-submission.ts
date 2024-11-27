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

    // Get the site URL from environment variables and ensure it's a valid URL
    const siteUrl = process.env.URL || process.env.DEPLOY_URL || process.env.SITE_URL || 'https://all7z.com';
    const baseUrl = new URL(siteUrl).origin;

    // Submit directly to Netlify Forms
    const response = await fetch(`${baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Netlify-Original-Path': '/',
        'X-Netlify-Form-Name': 'newsletter',
        'X-Netlify-Site': process.env.SITE_ID || '',
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

    // If we get a 200 response with HTML, consider it successful
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      const responseText = await response.text();
      console.log('Form submission response:', responseText);

      // If the response contains "Thank you", consider it successful
      if (responseText.includes('Thank you')) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Form submitted successfully',
            email: email
          })
        }
      }
    }

    // If we get here, something went wrong
    throw new Error(`Form submission failed: ${response.status}`);

  } catch (error) {
    console.error('Form submission error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
