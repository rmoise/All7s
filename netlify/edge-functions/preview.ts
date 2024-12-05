import { Context } from '@netlify/edge-functions'

interface EnvContext extends Context {
  env?: Record<string, string>
}

export default async function handler(request: Request, context?: EnvContext) {
  const headers = {
    'Content-Type': 'text/plain',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  }

  try {
    const url = new URL(request.url)
    const preview = url.searchParams.get('preview')

    // Debug log to check environment variables
    console.log('Debug request:', {
      url: request.url,
      preview,
      context: context ? 'exists' : 'undefined',
      env: context?.env ? Object.keys(context.env) : 'undefined'
    })

    if (preview !== '1') {
      return new Response('Invalid preview mode', {
        status: 401,
        headers
      })
    }

    // Return success with cookie
    return new Response(null, {
      status: 307,
      headers: {
        ...headers,
        'Location': '/?preview=1',
        'Set-Cookie': `sanity-preview-token=${context?.env?.SANITY_API_TOKEN || 'development-token'}; Path=/; HttpOnly; SameSite=Strict`
      },
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`, {
      status: 500,
      headers,
    })
  }
}
