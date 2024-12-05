import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES, SINGLETON_ACTIONS} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  return originalActions.filter((action) => {
    const actionName = action.name
    // Match the exact action names from SINGLETON_ACTIONS
    return ['PublishAction', 'DiscardChangesAction', 'RestoreAction'].includes(actionName || '')
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
