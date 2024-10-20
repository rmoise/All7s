import React from 'react';
import { UserComponent } from 'sanity/desk';
import { Stack, Select } from '@sanity/ui';

const DatasetSwitcher: UserComponent = (props) => {
  const [currentDataset, setCurrentDataset] = React.useState(
    typeof window !== 'undefined' ? localStorage.getItem('sanityDataset') || 'staging' : 'staging'
  );

  React.useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'staging';
    setCurrentDataset(storedDataset);
  }, []);

  const switchDataset = (dataset: string) => {
    setCurrentDataset(dataset);
    localStorage.setItem('sanityDataset', dataset);
    window.location.reload();
  };

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    switchDataset(event.target.value);
  };

  const datasets = ['production', 'staging'];

  return (
    <Stack>
      <Select
        fontSize={2}
        padding={3}
        space={3}
        value={currentDataset}
        onChange={handleDatasetChange}
        style={{color: 'black'}}
      >
        {datasets.map((dataset) => (
          <option key={dataset} value={dataset}>
            {dataset}
          </option>
        ))}
      </Select>
    </Stack>
  );
};

export default DatasetSwitcher;
