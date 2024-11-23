import { createClient } from '@sanity/client'
import { getConfig } from '@lib/config'
import { Environment, getCurrentEnvironment } from '@lib/environment'

export class AuthManager {
  private static instance: AuthManager
  private client: ReturnType<typeof createClient>
  private config = getConfig(getCurrentEnvironment())

  private constructor() {
    const token = process.env.SANITY_AUTH_TOKEN ||
                 process.env.SANITY_STUDIO_API_TOKEN ||
                 process.env.NEXT_PUBLIC_SANITY_TOKEN

    this.client = createClient({
      projectId: this.config.projectId,
      dataset: this.config.dataset,
      apiVersion: this.config.apiVersion,
      useCdn: this.config.useCdn,
      token: token
    })
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  async validateSession(token: string): Promise<boolean> {
    try {
      await this.client.fetch('*[_type == "home"][0]', {}, { token })
      return true
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  async getPreviewToken(): Promise<string | null> {
    const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET
    if (!previewSecret) return null

    try {
      const response = await this.client.request({
        url: `/auth/tokens/preview`,
        method: 'POST',
        body: {
          secret: previewSecret,
          duration: '24h'
        }
      })

      return response.token
    } catch (error) {
      console.error('Failed to generate preview token:', error)
      return null
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.client.request({ url: '/users/me' })
      return response
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  async logout() {
    try {
      await this.client.request({
        url: '/auth/logout',
        method: 'POST'
      })
      return true
    } catch (error) {
      console.error('Logout failed:', error)
      return false
    }
  }
}

// Export a singleton instance
export const authManager = AuthManager.getInstance()