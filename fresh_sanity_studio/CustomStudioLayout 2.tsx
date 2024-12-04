// CustomStudioLayout.tsx
import React from 'react'

export function CustomStudioLayout(props: {
  renderDefault: (props: any) => React.ReactElement
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Main content */}
      <div style={{ flexGrow: 1, overflow: 'auto' }}>
        {props.renderDefault(props)}
      </div>
    </div>
  )
}
