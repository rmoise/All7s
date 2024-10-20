// CustomStudioLayout.tsx
import React from 'react'
import {LayoutProps} from 'sanity'
import DatasetSwitcher from './components/DatasetSwitcher'

export function CustomStudioLayout(props: LayoutProps) {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{padding: '10px'}}>
        <DatasetSwitcher
          id="dataset-switcher"
          itemId="dataset-switcher"
          paneKey="dataset-switcher"
          urlParams={{}}
        />
      </div>
      {props.renderDefault(props)}
    </div>
  )
}
