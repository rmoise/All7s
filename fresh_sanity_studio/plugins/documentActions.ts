import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  return originalActions
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
