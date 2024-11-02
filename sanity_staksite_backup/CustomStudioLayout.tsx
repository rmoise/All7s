import React from 'react'
import {Box, Container} from '@sanity/ui'
import DatasetSwitcher from './components/DatasetSwitcher'

interface StudioLayoutProps {
  renderDefault: (props: StudioLayoutProps) => React.ReactNode
  title?: string
  name?: string
  dataset?: string
  projectId?: string
  scheme?: string
  basePath?: string
  tools?: Array<{
    name: string
    title: string
    icon?: React.ComponentType
  }>
}

export function CustomStudioLayout({renderDefault, ...rest}: StudioLayoutProps) {
  return (
    <Container>
      <Box padding={2}>
        <DatasetSwitcher
          id="dataset-switcher"
          itemId="dataset-switcher"
          paneKey="dataset-switcher"
          urlParams={{}}
        />
      </Box>
      {renderDefault({renderDefault, ...rest})}
    </Container>
  )
}
