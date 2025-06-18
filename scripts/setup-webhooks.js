const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: '1gxdk71x',
  dataset: 'production',
  apiVersion: '2024-03-19',
  token: process.env.SANITY_AUTH_TOKEN // Management token required
})

async function setupWebhooks() {
  try {
    const webhook = await client.request({
      uri: '/hooks',
      method: 'POST',
      body: {
        name: 'Home SEO Revalidation',
        url: 'https://all7z.com/api/revalidate',
        triggers: ['create', 'update', 'delete'],
        filter: '_type == "home"',
        httpMethod: 'POST',
        apiVersion: 'v2021-06-07',
        includeDrafts: false,
        headers: {},
        payload: {
          tag: 'home-seo',
          purgeCache: true
        }
      }
    })
    console.log('Webhook created:', webhook)
  } catch (error) {
    console.error('Error creating webhook:', error)
  }
}

setupWebhooks()