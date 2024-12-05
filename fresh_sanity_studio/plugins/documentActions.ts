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

  return originalActions.filter((action) => {
    const actionName = action.name?.toLowerCase()
    const originalName = (action as any).originalName?.toLowerCase()

    // Check both name and originalName against our blacklist
    const blacklist = ['duplicate', 'create', 'delete']
    return !blacklist.some(
      (blocked) =>
        actionName?.includes(blocked) || originalName?.includes(blocked)
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
