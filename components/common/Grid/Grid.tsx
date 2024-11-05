// components/common/Grid/Grid.tsx

import React from 'react';
import clsx from 'clsx';

interface GridProps {
  columns: number | {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64; // 8pt grid system values
  className?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  center?: boolean;
}

const Grid: React.FC<GridProps> = ({
  columns = 1,
  gap = 32,
  children,
  className = '',
  maxWidth = 'full',
  center = false,
}) => {
  // Convert columns object to Tailwind classes
  const gridColsClass = typeof columns === 'object'
    ? Object.entries(columns)
        .map(([breakpoint, cols]) => {
          return breakpoint === 'default'
            ? `grid-cols-${cols}`
            : `${breakpoint}:grid-cols-${cols}`;
        })
        .join(' ')
    : `grid-cols-${columns}`;

  return (
    <div
      className={clsx(
        'grid w-full',
        gridColsClass,
        `gap-${gap / 4}`, // Convert to Tailwind's 4pt system
        maxWidth !== 'full' && `max-w-${maxWidth}`,
        center && 'mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Grid;
