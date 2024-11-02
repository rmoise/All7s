import React, { useEffect, useState, forwardRef } from 'react';
import { Select, Box, Label } from '@sanity/ui';

const DatasetSwitcher = forwardRef((props, ref) => {
  const [currentDataset, setCurrentDataset] = useState(
    localStorage.getItem('sanityDataset') || 'staging'
  );

  useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'staging';
    setCurrentDataset(storedDataset);
  }, []);

  const handleDatasetChange = (event) => {
    const newDataset = event.target.value;
    setCurrentDataset(newDataset);
    localStorage.setItem('sanityDataset', newDataset);
    window.location.reload();
  };

  return (
    <Box padding={2} ref={ref}>
      <Label size={1} style={{ marginBottom: '4px', fontWeight: 500 }}>Dataset</Label>
      <Select
        value={currentDataset}
        onChange={handleDatasetChange}
        fontSize={1}
        padding={2}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '140px'
        }}
      >
        <option value="staging">Staging</option>
        <option value="production">Production</option>
      </Select>
    </Box>
  );
});

DatasetSwitcher.displayName = 'DatasetSwitcher';

export default DatasetSwitcher;