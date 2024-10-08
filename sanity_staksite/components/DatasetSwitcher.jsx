import React, { useEffect, useState, forwardRef } from 'react';

const DatasetSwitcher = forwardRef((props, ref) => {
  const [currentDataset, setCurrentDataset] = useState(
    localStorage.getItem('sanityDataset') || 'staging'
  );

  useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'staging';
    setCurrentDataset(storedDataset);
  }, []);

  const switchDataset = (dataset) => {
    setCurrentDataset(dataset);
    localStorage.setItem('sanityDataset', dataset);

    // Force reload to apply the new dataset
    window.location.reload();
  };

  return (
    <div style={{ padding: '10px' }} ref={ref}>
      <h4>Current Dataset: {currentDataset}</h4>
      <button
        onClick={() => switchDataset('production')}
        disabled={currentDataset === 'production'}
      >
        Switch to Production
      </button>
      <button
        onClick={() => switchDataset('staging')}
        disabled={currentDataset === 'staging'}
      >
        Switch to Staging
      </button>
    </div>
  );
});

export default DatasetSwitcher;
