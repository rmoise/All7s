import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES} from '../sanity.config'

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  // Log actions in production for debugging
  if (process.env.NODE_ENV === 'production') {
    console.group('Singleton Actions')
    console.log(
      'Original actions:',
      originalActions.map((a) => a.name),
    )
    console.groupEnd()
  }

  return originalActions.filter((action) => {
    const actionName = action.name?.toLowerCase()
    // Be more permissive with action names and match both formats
    return ![
      'duplicate',
      'create',
      'delete',
      'duplicateaction',
      'createaction',
      'deleteaction',
    ].includes(actionName || '')
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
