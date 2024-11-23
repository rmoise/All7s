import { ClientConfig } from '@sanity/client'
import { RocketIcon, RobotIcon } from '@sanity/icons'
import type { Environment } from './environment'

import { SINGLETON_ACTIONS, SINGLETON_TYPES } from '@fresh_sanity_studio/sanity.config'

export interface EnhancedClientConfig extends ClientConfig {
  stega?: {
    enabled: boolean
    studioUrl?: string
  }
}

export interface EnvironmentConfig {
  name: string
  title: string
  projectId: string
  dataset: string
  apiVersion: string
  basePath: string
  icon: any
  baseUrl: string
  useCdn: boolean
  auth: {
    providers: string[]
    callbackUrl: string
  }
  preview: {
    enabled: boolean
  }
}

const environments: Record<string, EnvironmentConfig> = {
  production: {
    name: 'production',
    title: 'Production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: 'production',
    apiVersion: '2024-03-19',
    basePath: '/production',
    icon: RocketIcon,
    baseUrl: 'https://all7z.com',
    useCdn: true,
    auth: {
      providers: ['google'],
      callbackUrl: 'https://all7z.com/api/auth/callback'
    },
    preview: {
      enabled: false
    }
  },
  staging: {
    name: 'staging',
    title: 'Staging',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: 'staging',
    apiVersion: '2024-03-19',
    basePath: '/staging',
    icon: RobotIcon,
    baseUrl: 'https://staging--all7z.netlify.app',
    useCdn: false,
    auth: {
      providers: ['google'],
      callbackUrl: 'https://staging--all7z.netlify.app/api/auth/callback'
    },
    preview: {
      enabled: true
    }
  },
  development: {
    name: 'development',
    title: 'Development',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: 'development',
    apiVersion: '2024-03-19',
    basePath: '/development',
    icon: RobotIcon,
    baseUrl: 'http://localhost:3000',
    useCdn: false,
    auth: {
      providers: ['google'],
      callbackUrl: 'http://localhost:3000/api/auth/callback'
    },
    preview: {
      enabled: true
    }
  }
}

export const getConfig = (env: Environment) => environments[env]

export default environments