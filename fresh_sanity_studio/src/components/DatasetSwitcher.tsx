import React, { useEffect, useState } from 'react'
import { Stack, Select, Text, Box, Card } from '@sanity/ui'
import { useStudio } from './StudioProvider'

const DatasetSwitcher = () => {
  const { dataset, setDataset, client } = useStudio()
  const [currentDataset, setCurrentDataset] = useState<string>(() => {
    if (typeof window === 'undefined') return 'staging'
    return localStorage.getItem('sanityDataset') || 'staging'
  })

  const [datasets, setDatasets] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setIsLoading(true)
        const response = await client.request({
          url: '/datasets',
          method: 'GET',
        })
        const datasetNames = response.map((d: any) => d.name)
        setDatasets(datasetNames)
      } catch (error) {
        console.error('Failed to fetch datasets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatasets()
  }, [client])

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDataset = event.target.value
    localStorage.setItem('sanityDataset', newDataset)
    setCurrentDataset(newDataset)
    setDataset(newDataset)
    window.location.reload()
  }

  if (isLoading || !datasets.length) {
    return (
      <Card padding={3}>
        <Text size={1}>Loading datasets...</Text>
      </Card>
    )
  }

  return (
    <Card padding={3}>
      <Stack space={3}>
        <Box>
          <Text size={1} weight="semibold">
            Current Dataset: {currentDataset}
          </Text>
        </Box>
        <Select value={currentDataset} onChange={handleDatasetChange}>
          {datasets.map((dataset) => (
            <option key={dataset} value={dataset}>
              {dataset}
            </option>
          ))}
        </Select>
      </Stack>
    </Card>
  )
}

export default DatasetSwitcher