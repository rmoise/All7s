import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const Grid = ({ columns = 1, gap = 32, children, className = '' }) => {
  let gridColsClass = 'grid-cols-1'; // Default

  if (typeof columns === 'object') {
    // Responsive columns
    gridColsClass = Object.entries(columns)
      .map(([breakpoint, cols]) => {
        return breakpoint === 'default' ? `grid-cols-${cols}` : `${breakpoint}:grid-cols-${cols}`;
      })
      .join(' ');
  } else {
    // Fixed columns
    gridColsClass = `grid-cols-${columns}`;
  }

  // Calculate Tailwind's gap classes based on the 8pt grid (gap-32 = gap-8 in Tailwind)
  const gapClass = `gap-${gap / 4}`;

  return (
    <div className={clsx('grid', gridColsClass, gapClass, className)}>
      {children}
    </div>
  );
};

Grid.propTypes = {
  columns: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      default: PropTypes.number,
      sm: PropTypes.number,
      md: PropTypes.number,
      lg: PropTypes.number,
      xl: PropTypes.number,
      '2xl': PropTypes.number,
    }),
  ]),
  gap: PropTypes.number, // Should be a multiple of 8 (e.g., 8, 16, 24, 32)
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Grid;
