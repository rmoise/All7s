import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  // Log actions in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.group('Singleton Actions')
    console.log(
      'Original actions:',
      originalActions.map((a) => ({
        name: a.name,
        originalName: (a as any).originalName,
      }))
    )
    console.groupEnd()
  }

  // Whitelist approach instead of blacklist
  const allowedActions = ['publish', 'discardchanges', 'restore']

  return originalActions.filter((action) => {
    const actionName = action.name?.toLowerCase() || ''
    const originalName = (action as any).originalName?.toLowerCase() || ''

    return allowedActions.some(
      (allowed) =>
        actionName.includes(allowed) ||
        originalName.includes(allowed)
    )
  })
}

export function getDocumentActions(props: {
  schemaType: string
  actions: DocumentActionComponent[]
}) {
  const {schemaType, actions} = props

  if (SINGLETON_TYPES.has(schemaType)) {
    return getSingletonActions(actions)
  }

  return actions
}
