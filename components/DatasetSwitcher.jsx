import React, { useEffect, useState, forwardRef } from 'react';

const DatasetSwitcher = forwardRef((props, ref) => {
  const [currentDataset, setCurrentDataset] = useState('production');

  useEffect(() => {
    const storedDataset = localStorage.getItem('sanityDataset') || 'production';
    setCurrentDataset(storedDataset);
    console.log('Loaded dataset from localStorage:', storedDataset);

    const storedToken = localStorage.getItem('sanityToken');
    if (!storedToken) {
      const newToken = storedDataset === 'staging'
        ? process.env.NEXT_PUBLIC_SANITY_STAGING_TOKEN
        : process.env.NEXT_PUBLIC_SANITY_TOKEN;
      localStorage.setItem('sanityToken', newToken);
      console.log(`Set token for ${storedDataset} dataset:`, newToken);
    }
  }, []);

  const switchDataset = (dataset) => {
    setCurrentDataset(dataset);
    localStorage.setItem('sanityDataset', dataset);

    const token = dataset === 'staging'
      ? process.env.NEXT_PUBLIC_SANITY_STAGING_TOKEN
      : process.env.NEXT_PUBLIC_SANITY_TOKEN;

    console.log(`Switched to ${dataset} dataset with token: ${token}`);
    localStorage.setItem('sanityToken', token);

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
