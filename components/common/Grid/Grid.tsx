// components/common/Grid/Grid.tsx

import React from 'react'
import clsx from 'clsx'

interface GridProps {
  columns?:
    | number
    | {
        default: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
      }
  gap?: 8 | 16 | 24 | 32 | 40 | 48 | 56 | 64
  className?: string
  children: React.ReactNode
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | 'full'
  center?: boolean
  container?: boolean
  fullWidth?: boolean
  isGrid?: boolean
}

const Grid: React.FC<GridProps> = ({
  columns = 1,
  gap = 32,
  children,
  className = '',
  maxWidth = 'full',
  center = false,
  container = false,
  fullWidth = false,
  isGrid = true,
}) => {
  // Base container classes that should be applied unless fullWidth is true
  const containerClasses = !fullWidth
    ? 'mx-auto max-w-7xl px-4 sm:px-8 lg:px-16'
    : ''

  // Grid classes that should only be applied when isGrid is true
  const gridClasses = isGrid
    ? clsx(
        'grid',
        typeof columns === 'object'
          ? Object.entries(columns)
              .map(([breakpoint, cols]) => {
                return breakpoint === 'default'
                  ? `grid-cols-${cols}`
                  : `${breakpoint}:grid-cols-${cols}`
              })
              .join(' ')
          : `grid-cols-${columns}`,
        `gap-${gap / 4}`
      )
    : ''

  return (
    <div className={clsx('w-full', containerClasses, gridClasses, className)}>
      {children}
    </div>
  )
}

export default Grid
