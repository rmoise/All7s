// CustomStudioLayout.tsx
import React from 'react'
import { Box } from '@sanity/ui'
import DatasetSwitcher from './components/DatasetSwitcher'

export function CustomStudioLayout(props: {
  renderDefault: (props: any) => React.ReactElement
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header container for dataset switcher */}
      <div style={{
        borderBottom: '1px solid #e6e6e6',
        background: '#fff',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        height: '48px'
      }}>
        <Box style={{ width: '150px' }}>  {/* Adjusted width for dropdown */}
          <DatasetSwitcher />
        </Box>
      </div>

      {/* Main content */}
      <div style={{ flexGrow: 1, overflow: 'auto' }}>
        {props.renderDefault(props)}
      </div>
    </div>
  )
}
