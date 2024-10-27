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

  // Calculate Tailwind's gap classes based on 8pt grid (gap-32 = gap-8)
  const gapClass = `gap-${gap / 4}`; // For gap=32, class becomes 'gap-8'

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
  gap: PropTypes.number, // Must be multiples of 4 (gap-8 = 32px)
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Grid;
