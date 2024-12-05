import type {DocumentActionComponent} from 'sanity'
import {SINGLETON_TYPES, SINGLETON_ACTIONS} from '../sanity.config'

// Updated action mapping to match actual Sanity action names
const ACTION_MAP = {
  PublishAction: 'PublishAction',
  ScheduleAction: 'ScheduleAction',
  UnpublishAction: 'UnpublishAction',
  DiscardChangesAction: 'DiscardChangesAction',
  DuplicateAction: 'DuplicateAction',
  DeleteAction: 'DeleteAction',
  HistoryRestoreAction: 'RestoreAction',
  TaskCreateAction: 'TaskAction',
  StartInCreateActionWrapper: 'StartAction'
} as const

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  try {
    if (!Array.isArray(originalActions)) {
      return []
    }

    console.log('Singleton Actions')
    console.log('Original actions:', originalActions)

    // Keep all publish and discard actions
    const filteredActions = originalActions.filter((action) => {
      const actionName = action.name
      console.log(`Processing action: ${actionName}`)

      // Directly check the action name since it matches the actual names
      return actionName === 'PublishAction' || actionName === 'DiscardChangesAction'
    })

    console.log('Filtered actions:', filteredActions)
    return filteredActions

  } catch (error) {
    console.error('Error in getSingletonActions:', error)
    return originalActions
  }
}

export function getDocumentActions(props: {
  schemaType: string
  actions: DocumentActionComponent[]
}) {
  const {schemaType, actions} = props

  // Only apply filtering for singleton types
  if (SINGLETON_TYPES.has(schemaType)) {
    return getSingletonActions(actions)
  }

  return actions
}
