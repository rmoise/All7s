import { DefaultDocumentNodeResolver } from 'sanity/desk'

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document().views([S.view.form()])
}