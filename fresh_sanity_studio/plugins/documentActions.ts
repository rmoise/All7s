import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  return originalActions.filter(action => {
    if (typeof action === 'function') {
      const actionName = action.displayName || action.name
      return ['PublishAction', 'DiscardChangesAction'].includes(actionName)
    }
    return false
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
