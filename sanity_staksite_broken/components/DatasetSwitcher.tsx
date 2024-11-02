import React from 'react'
import {Stack, Card, Box, Button} from '@sanity/ui'

interface DatasetSwitcherProps {
  id?: string
  itemId?: string
  paneKey?: string
  urlParams?: Record<string, unknown>
}

const DatasetSwitcher: React.FC<DatasetSwitcherProps> = () => {
  const [currentDataset, setCurrentDataset] = React.useState(
    typeof window !== 'undefined' ? localStorage.getItem('sanityDataset') || 'staging' : 'staging'
  )

  React.useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'staging'
    setCurrentDataset(storedDataset)
  }, [])

  const switchDataset = (dataset: string) => {
    setCurrentDataset(dataset)
    localStorage.setItem('sanityDataset', dataset)
    window.location.reload()
  }

  const datasets = ['production', 'staging']

  return (
    <Stack>
      <Card padding={3}>
        <Box>
          {datasets.map((dataset) => (
            <Button
              key={dataset}
              mode={currentDataset === dataset ? 'default' : 'ghost'}
              onClick={() => switchDataset(dataset)}
              text={dataset}
              padding={3}
              fontSize={2}
              style={{
                width: '100%',
                marginBottom: dataset !== datasets[datasets.length - 1] ? '8px' : 0
              }}
            />
          ))}
        </Box>
      </Card>
    </Stack>
  )
}

export default DatasetSwitcher
