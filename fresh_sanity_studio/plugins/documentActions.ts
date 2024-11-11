import type {DocumentActionComponent} from 'sanity'

// Define the singleton types
const singletonTypes = new Set(['home', 'settings'])

export function getSingletonActions(originalActions: DocumentActionComponent[]) {
  return originalActions.filter(action => {
    // Get the action name from the action component
    const actionName = action.action || action.name

    // Only allow specific actions for singletons
    return ['PublishAction', 'DiscardChangesAction', 'RestoreAction'].includes(actionName)
  })
}

export function getDocumentActions(props: {schemaType: string, actions: DocumentActionComponent[]}) {
  const {schemaType, actions} = props

  // Apply singleton restrictions
  if (singletonTypes.has(schemaType)) {
    return getSingletonActions(actions)
  }

  // Return all actions for non-singleton documents
  return actions
} 