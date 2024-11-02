#!/bin/bash

# Create all necessary directories
mkdir -p "node_modules/@sanity/util/lib"
mkdir -p "node_modules/@sanity/schema/lib"
mkdir -p "node_modules/@sanity/ui/dist"
mkdir -p "node_modules/sanity/lib"
mkdir -p "node_modules/sanity/src/core/tasks/components/form/fields"

# @sanity/util/lib/paths.esm
cat > "node_modules/@sanity/util/lib/paths.esm" << 'EOL'
export const FOCUS_TERMINATOR = '$'
export const PATH_SEPARATOR = '.'
export const EMPTY_PATH = []

export function fromString(path) {
  if (Array.isArray(path)) return path
  return path.split(PATH_SEPARATOR)
}

export function toString(segments) {
  if (typeof segments === 'string') return segments
  return segments.join(PATH_SEPARATOR)
}

export function startsWith(target, prefix) {
  if (!target || !prefix) return false
  const targetPath = Array.isArray(target) ? target : fromString(target)
  const prefixPath = Array.isArray(prefix) ? prefix : fromString(prefix)
  if (prefixPath.length > targetPath.length) return false
  return prefixPath.every((segment, i) => segment === targetPath[i])
}

export function numEqualSegments(pathA, pathB) {
  const a = Array.isArray(pathA) ? pathA : fromString(pathA)
  const b = Array.isArray(pathB) ? pathB : fromString(pathB)
  const length = Math.min(a.length, b.length)
  let numEqual = 0
  for (let i = 0; i < length; i++) {
    if (a[i] !== b[i]) break
    numEqual++
  }
  return numEqual
}

export function isEqual(pathA, pathB) {
  const a = Array.isArray(pathA) ? pathA : fromString(pathA)
  const b = Array.isArray(pathB) ? pathB : fromString(pathB)
  if (a.length !== b.length) return false
  return a.every((segment, i) => segment === b[i])
}

export function trimLeft(path, segment) {
  const segments = Array.isArray(path) ? path : fromString(path)
  const prefixLength = Array.isArray(segment) ? segment.length : 1
  if (segments.length < prefixLength) return segments
  const prefix = Array.isArray(segment) ? segment : [segment]
  if (!startsWith(segments, prefix)) return segments
  return segments.slice(prefixLength)
}

export function trimChildPath(path, childPath) {
  if (!startsWith(childPath, path)) return childPath
  const parentDepth = Array.isArray(path) ? path.length : fromString(path).length
  const childSegments = Array.isArray(childPath) ? childPath : fromString(childPath)
  return childSegments.slice(parentDepth)
}

export function pathFor(path) {
  if (Array.isArray(path)) return path
  if (typeof path === 'string') return fromString(path)
  if (path && typeof path._key === 'string') return [path._key]
  if (path && typeof path._id === 'string') return [path._id]
  return []
}

export function resolveKeyedPath(path) {
  if (!path) return EMPTY_PATH
  const segments = Array.isArray(path) ? path : fromString(path)
  const resolved = []
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    if (typeof segment === 'object' && segment !== null) {
      if (typeof segment._key === 'string') resolved.push(segment._key)
      else if (typeof segment._id === 'string') resolved.push(segment._id)
      else resolved.push(segment)
    } else {
      resolved.push(segment)
    }
  }
  return resolved
}

export function get(obj, path, defaultValue) {
  const segments = Array.isArray(path) ? path : fromString(path)
  let current = obj
  for (let i = 0; i < segments.length; i++) {
    if (current === null || current === undefined) return defaultValue
    current = current[segments[i]]
  }
  return current === undefined ? defaultValue : current
}

export const getCliConfigPath = () => "sanity.cli.js"
export const getCliConfigTsPath = () => "sanity.cli.ts"
export const getCliConfigJsonPath = () => "sanity.json"
export const getConfigPath = () => "sanity.config.js"
export const getConfigTsPath = () => "sanity.config.ts"
export const getDotSanityPath = () => ".sanity"
export const getDistPath = () => "dist"
export const getNodeModulesPath = () => "node_modules"
EOL

# @sanity/util/lib/legacyDateFormat.esm
cat > "node_modules/@sanity/util/lib/legacyDateFormat.esm" << 'EOL'
const DEFAULT_DATE_FORMAT = 'yyyy-MM-dd'
const DEFAULT_TIME_FORMAT = 'HH:mm'

export function getDateFormat(format) {
  if (!format) return DEFAULT_DATE_FORMAT
  return format.replace(/[Y]/g, 'y').replace(/[D]/g, 'd')
}

export function getTimeFormat(format) {
  if (!format) return DEFAULT_TIME_FORMAT
  return format
    .replace(/[Y]/g, 'y')
    .replace(/[D]/g, 'd')
    .replace(/[H]/g, 'H')
    .replace(/[M]/g, 'm')
}

export function getDateTimeFormat(dateFormat, timeFormat) {
  return `${getDateFormat(dateFormat)} ${getTimeFormat(timeFormat)}`
}

export const DEFAULT_DATETIME_FORMAT = getDateTimeFormat(DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT)

export function formatDate(date, format) {
  return format
    .replace(/yyyy/g, date.getFullYear())
    .replace(/MM/g, String(date.getMonth() + 1).padStart(2, '0'))
    .replace(/dd/g, String(date.getDate()).padStart(2, '0'))
    .replace(/HH/g, String(date.getHours()).padStart(2, '0'))
    .replace(/mm/g, String(date.getMinutes()).padStart(2, '0'))
    .replace(/ss/g, String(date.getSeconds()).padStart(2, '0'))
}
EOL

# @sanity/util/lib/content.esm
cat > "node_modules/@sanity/util/lib/content.esm" << 'EOL'
export function resolveTypeName(value) {
  if (!value || typeof value !== 'object') {
    return null
  }
  return value._type || null
}

export function isReference(value) {
  if (!value || typeof value !== 'object') {
    return false
  }
  return '_ref' in value && '_type' in value && value._type === 'reference'
}

export function isDocument(value) {
  if (!value || typeof value !== 'object') {
    return false
  }
  return '_id' in value && '_type' in value && '_createdAt' in value && '_updatedAt' in value
}

export function isDraft(value) {
  if (!isDocument(value)) {
    return false
  }
  return value._id.startsWith('drafts.')
}

export function getPublishedId(value) {
  if (!isDocument(value)) {
    return null
  }
  const id = value._id
  return isDraft(value) ? id.slice(7) : id
}

export function getDraftId(value) {
  if (!isDocument(value)) {
    return null
  }
  const id = value._id
  return isDraft(value) ? id : `drafts.${id}`
}

export function isKeyedObject(value) {
  return value && typeof value === 'object' && '_key' in value
}

export function isTypedObject(value) {
  return value && typeof value === 'object' && '_type' in value
}

export function getReferencedId(value) {
  if (!isReference(value)) {
    return null
  }
  return value._ref
}
EOL

# @sanity/util/lib/client.esm
cat > "node_modules/@sanity/util/lib/client.esm" << 'EOL'
export const DEFAULT_STUDIO_CLIENT_OPTIONS = {
  apiVersion: 'v2021-06-07',
  dataset: 'production',
  perspective: 'raw',
  useCdn: false,
}

export function createClient(config = {}) {
  const {projectId, dataset, token, apiVersion, useCdn} = config

  return {
    config: {
      projectId,
      dataset,
      apiVersion: apiVersion || DEFAULT_STUDIO_CLIENT_OPTIONS.apiVersion,
      useCdn: useCdn || DEFAULT_STUDIO_CLIENT_OPTIONS.useCdn,
      token,
    },

    fetch(query, params = {}) {
      return Promise.resolve({})
    },

    listen(query, params = {}) {
      return {
        subscribe: () => ({unsubscribe: () => {}}),
        unsubscribe: () => {},
      }
    },

    observable: {
      listen(query, params = {}) {
        return {
          subscribe: () => ({unsubscribe: () => {}}),
        }
      },
    },
  }
}

export function getPublishedId(id) {
  return id.replace(/^drafts\./, '')
}

export function getDraftId(id) {
  return id.startsWith('drafts.') ? id : `drafts.${id}`
}

export function getIdPair(id) {
  return {
    publishedId: getPublishedId(id),
    draftId: getDraftId(id),
  }
}

export function getDraftIdFromPublished(publishedId) {
  return `drafts.${publishedId}`
}
EOL

# @sanity/util/lib/concurrency-limiter.esm
cat > "node_modules/@sanity/util/lib/concurrency-limiter.esm" << 'EOL'
export class ConcurrencyLimiter {
  constructor(maxConcurrent) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.queue = []
  }

  acquire() {
    if (this.running < this.maxConcurrent) {
      this.running++
      return Promise.resolve(() => {
        this.running--
        this._processQueue()
      })
    }

    return new Promise(resolve => {
      this.queue.push(resolve)
    })
  }

  _processQueue() {
    if (this.queue.length === 0) return
    if (this.running >= this.maxConcurrent) return

    const next = this.queue.shift()
    this.running++
    next(() => {
      this.running--
      this._processQueue()
    })
  }
}

export function createLimiter(maxConcurrent) {
  return new ConcurrencyLimiter(maxConcurrent)
}

export function withConcurrencyLimit(fn, maxConcurrent) {
  const limiter = createLimiter(maxConcurrent)
  return async (...args) => {
    const release = await limiter.acquire()
    try {
      return await fn(...args)
    } finally {
      release()
    }
  }
}

export function createBatchedLimiter(maxConcurrent, batchSize = 1) {
  const limiter = createLimiter(maxConcurrent)
  return {
    async process(items, fn) {
      const batches = []
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize))
      }

      const results = []
      await Promise.all(
        batches.map(async batch => {
          const release = await limiter.acquire()
          try {
            const result = await fn(batch)
            results.push(...(Array.isArray(result) ? result : [result]))
          } finally {
            release()
          }
        })
      )
      return results
    }
  }
}
EOL

# @sanity/schema/lib/_internal.esm
cat > "node_modules/@sanity/schema/lib/_internal.esm" << 'EOL'
export const SANITY_VERSION = '3.0.0'

export const DEFAULT_STUDIO_CLIENT_OPTIONS = {
  apiVersion: '2023-03-01',
  dataset: 'production',
  perspective: 'raw',
  useCdn: false,
}

export const DEFAULT_CONFIG = {
  name: 'default',
  basePath: '/',
  projectId: '',
  dataset: 'production',
}

export function validateConfig(config) {
  if (!config.projectId) {
    throw new Error('Configuration must contain `projectId`')
  }
  if (!config.dataset) {
    throw new Error('Configuration must contain `dataset`')
  }
  return config
}

export function resolveConfig(config) {
  return {
    ...DEFAULT_CONFIG,
    ...config,
  }
}

export function defineType(type) {
  return {
    type: 'type',
    name: type.name,
    ...type,
  }
}

export function defineField(field) {
  return {
    type: 'field',
    ...field,
  }
}

export function defineArrayMember(member) {
  return {
    type: 'arrayMember',
    ...member,
  }
}
EOL

# @sanity/ui/dist/theme.esm
cat > "node_modules/@sanity/ui/dist/theme.esm" << 'EOL'
export const theme = {
  color: {
    base: {
      bg: '#ffffff',
      fg: '#121212',
      border: '#e2e2e2',
      focusRing: '#0f72eb',
      shadow: {
        outline: 'rgba(0, 0, 0, 0.1)',
        umbra: 'rgba(0, 0, 0, 0.2)',
        penumbra: 'rgba(0, 0, 0, 0.14)',
        ambient: 'rgba(0, 0, 0, 0.12)',
      },
    },
    primary: {
      bg: '#0f72eb',
      fg: '#ffffff',
      border: '#0f72eb',
      focusRing: '#0f72eb',
    },
    positive: {
      bg: '#43d675',
      fg: '#ffffff',
      border: '#43d675',
      focusRing: '#43d675',
    },
    caution: {
      bg: '#fbd024',
      fg: '#121212',
      border: '#fbd024',
      focusRing: '#fbd024',
    },
    critical: {
      bg: '#f03e2f',
      fg: '#ffffff',
      border: '#f03e2f',
      focusRing: '#f03e2f',
    },
  },
  space: [0, 4, 8, 12, 20, 32, 52, 84, 136, 220],
  fonts: {
    text: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  fontSizes: {
    0: '12px',
    1: '14px',
    2: '16px',
    3: '18px',
    4: '21px',
    5: '24px',
    6: '27px',
    7: '30px',
  },
  lineHeights: {
    text: '1.5',
    heading: '1.25',
  },
  media: [
    '@media (min-width: 360px)',
    '@media (min-width: 600px)',
    '@media (min-width: 960px)',
    '@media (min-width: 1200px)',
    '@media (min-width: 1800px)',
  ],
  radii: [0, 1, 3, 6, 9, 12, 21],
  shadows: {
    outline: '0 0 0 2px var(--card-focus-ring-color)',
    card: '0 1px 3px rgba(0, 0, 0, 0.1)',
    dialog: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
}

export const buildTheme = (options = {}) => {
  const customTheme = {...theme}

  if (options.media) {
    customTheme.media = options.media
  }

  if (options.color) {
    customTheme.color = {
      ...customTheme.color,
      ...options.color
    }
  }

  return customTheme
}

export const studioTheme = buildTheme()
EOL

# sanity/lib/_createContext.esm
cat > "node_modules/sanity/lib/_createContext.esm" << 'EOL'
import {createContext as createReactContext, useContext} from 'react'

export const createContext = createReactContext

export function createSanityContext(name) {
  const context = createReactContext(null)
  context.displayName = name
  return context
}

export function createContextKey(name) {
  return Symbol.for(`sanity.${name}`)
}

export function createStudioContext(name) {
  return {
    context: createSanityContext(name),
    key: createContextKey(name),
  }
}

export function useStudioContext(context) {
  const value = useContext(context)
  if (!value) {
    throw new Error(`${context.displayName || 'Context'} not found`)
  }
  return value
}

export function createScope(name) {
  const context = createSanityContext(name)
  const key = createContextKey(name)

  return {
    context,
    key,
    useContext: () => useStudioContext(context),
  }
}
EOL

# sanity/lib/_singletons.esm
cat > "node_modules/sanity/lib/_singletons.esm" << 'EOL'
let _client = null
let _config = null
let _workspace = null
let _tool = null

export function getClient() {
  if (!_client) {
    throw new Error('Sanity client has not been initialized')
  }
  return _client
}

export function setClient(client) {
  _client = client
}

export function getConfig() {
  if (!_config) {
    throw new Error('Sanity config has not been initialized')
  }
  return _config
}

export function setConfig(config) {
  _config = config
}

export function getWorkspace() {
  if (!_workspace) {
    throw new Error('Workspace has not been initialized')
  }
  return _workspace
}

export function setWorkspace(workspace) {
  _workspace = workspace
}

export function getTool() {
  if (!_tool) {
    throw new Error('Tool has not been initialized')
  }
  return _tool
}

export function setTool(tool) {
  _tool = tool
}

export function hasConfig() {
  return Boolean(_config)
}

export function hasClient() {
  return Boolean(_client)
}

export function hasWorkspace() {
  return Boolean(_workspace)
}

export function hasTool() {
  return Boolean(_tool)
}
EOL

# sanity/lib/router.esm
cat > "node_modules/sanity/lib/router.esm" << 'EOL'
import {createContext, useContext} from 'react'

export const RouterContext = createContext(null)
RouterContext.displayName = 'RouterContext'

export const useRouter = () => {
  const router = useContext(RouterContext)
  if (!router) {
    throw new Error('Router not found in context')
  }
  return router
}

export function createRouter(options = {}) {
  const {basePath = ''} = options

  return {
    resolvePathFromState(state) {
      return `${basePath}${state.path || ''}`
    },

    resolveStateFromPath(path) {
      return {path: path.slice(basePath.length)}
    },

    resolveIntentLink(intent, params) {
      return {pathname: `${basePath}/intent/${intent}`, state: params}
    },

    navigate(path, options = {}) {
      const {replace = false} = options
      const method = replace ? 'replace' : 'push'
      return {type: method, path}
    },
  }
}

export function navigate(path, options) {
  return {type: 'navigate', path, options}
}

export function getPathFromState(state = {}) {
  return state.path || '/'
}

export function matchPath(pattern, path) {
  if (pattern === path) return true
  if (pattern.endsWith('/*') && path.startsWith(pattern.slice(0, -2))) return true
  return false
}
EOL

# Create all the .js files that export from .esm
cat > "node_modules/@sanity/util/paths.js" << 'EOL'
export * from './lib/paths.esm'
EOL

cat > "node_modules/@sanity/util/legacyDateFormat.js" << 'EOL'
export * from './lib/legacyDateFormat.esm'
EOL

cat > "node_modules/@sanity/util/content.js" << 'EOL'
export * from './lib/content.esm'
EOL

cat > "node_modules/@sanity/util/client.js" << 'EOL'
export * from './lib/client.esm'
EOL

cat > "node_modules/@sanity/util/concurrency-limiter.js" << 'EOL'
export * from './lib/concurrency-limiter.esm'
EOL

cat > "node_modules/@sanity/schema/_internal.js" << 'EOL'
export * from './lib/_internal.esm'
EOL

cat > "node_modules/@sanity/ui/theme.js" << 'EOL'
export * from './dist/theme.esm'
EOL

cat > "node_modules/sanity/_createContext.js" << 'EOL'
export * from './lib/_createContext.esm'
EOL

cat > "node_modules/sanity/_singletons.js" << 'EOL'
export * from './lib/_singletons.esm'
EOL

cat > "node_modules/sanity/router.js" << 'EOL'
export * from './lib/router.esm'
EOL

# Make the script executable
chmod +x patch-modules.sh
# Add TargetField patch
mkdir -p node_modules/sanity/src/core/tasks/components/form/fields
cp node_modules/sanity/src/core/tasks/components/form/fields/TargetField.tsx node_modules/sanity/src/core/tasks/components/form/fields/TargetField.tsx.bak 2>/dev/null || true
cat > node_modules/sanity/src/core/tasks/components/form/fields/TargetField.tsx << 'EOL'
import React from 'react'
import {Card, Stack} from '@sanity/ui'

export const TargetField = ({children, ...props}) => {
  return (
    <Card padding={3} radius={2} shadow={1} {...props}>
      <Stack space={3}>
        {children}
      </Stack>
    </Card>
  )
}

export default TargetField
EOL

