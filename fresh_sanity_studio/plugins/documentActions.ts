import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES, SINGLETON_ACTIONS} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  console.log('Original actions:', originalActions.map(action => action.name))  // Debug log
  return originalActions.filter(action => {
    const actionName = action.name
    return SINGLETON_ACTIONS.has(actionName)
  })
}

export function getDocumentActions(props: {schemaType: string, actions: DocumentActionComponent[]}) {
  const {schemaType, actions} = props

  if (SINGLETON_TYPES.has(schemaType)) {
    return getSingletonActions(actions)
  }

  return actions
}
