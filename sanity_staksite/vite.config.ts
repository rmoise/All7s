import {defineConfig} from 'vite'
import path from 'path'

const virtualModuleId = '@sanity/util/lib/paths.esm'
const resolvedVirtualModuleId = '\0' + virtualModuleId

export default defineConfig({
  plugins: [{
    name: 'sanity-util-resolver',
    resolveId(id) {
      if (id === '@sanity/util/lib/paths.esm' ||
          id === '@sanity/util/lib/legacyDateFormat.esm' ||
          id === '@sanity/util/lib/content.esm') {
        return '\0' + id
      }
    },
    load(id) {
      if (id === '\0@sanity/util/lib/paths.esm') {
        return `
          export const getCliConfigPath = () => 'sanity.cli.js'
          export const getCliConfigTsPath = () => 'sanity.cli.ts'
          export const getCliConfigJsonPath = () => 'sanity.json'
          export const getConfigPath = () => 'sanity.config.js'
          export const getConfigTsPath = () => 'sanity.config.ts'
        `
      }
      if (id === '\0@sanity/util/lib/legacyDateFormat.esm') {
        return `
          export const toDateString = (date) => date ? (date instanceof Date ? date.toISOString() : date) : ''
          export const parseDate = (date) => date ? new Date(date) : null
          export const formatDate = (date) => date ? (date instanceof Date ? date : new Date(date)).toISOString() : ''
        `
      }
      if (id === '\0@sanity/util/lib/content.esm') {
        return `
          export const resolveTypeName = (value) => value ? value._type || null : null
          export const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
          export const isPlainObject = (value) => isRecord(value) && (!Object.getPrototypeOf(value) || Object.getPrototypeOf(value) === Object.prototype)
          export const isDocumentLike = (value) => isRecord(value) && typeof value._type === 'string'
          export const isReference = (value) => isRecord(value) && value._type === 'reference' && '_ref' in value
        `
      }
    }
  }],
  resolve: {
    alias: {
      '@sanity/util/paths': path.resolve(__dirname, 'node_modules/@sanity/util/paths.js')
    }
  }
}) 