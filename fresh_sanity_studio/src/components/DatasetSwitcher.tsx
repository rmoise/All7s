import React, { useEffect, useState } from 'react'
import { Stack, Select, Text, Box, Card } from '@sanity/ui'
import { useClient } from 'sanity'

const DatasetSwitcher = () => {
  const [currentDataset, setCurrentDataset] = useState(
    localStorage.getItem('sanityDataset') || 'staging'
  )
  const client = useClient({apiVersion: '2021-06-07'})

  useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'staging'
    setCurrentDataset(storedDataset)
    client.config().dataset = storedDataset
  }, [client])

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newDataset = event.currentTarget.value
    setCurrentDataset(newDataset)
    localStorage.setItem('sanityDataset', newDataset)
    window.location.reload()
  }

  return (
    <Card padding={3} tone="transparent" style={{ backgroundColor: 'white' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          paddingLeft: '12px'
        }}
      >
        <Text weight="semibold" size={1}>Dataset:</Text>
        <Select
          value={currentDataset}
          onChange={handleDatasetChange}
          fontSize={1}
        >
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </Select>
      </div>
    </Card>
  )
}

export default DatasetSwitcher