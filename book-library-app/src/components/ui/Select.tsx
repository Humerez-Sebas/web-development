'use client'

import * as React from 'react'
import clsx from 'clsx'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  fullWidth?: boolean
  error?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, fullWidth, error, children, ...props }, ref) => {
    return (
      <div className={clsx('relative', fullWidth && 'w-full')}>
        <select
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400',
            'border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100',
            'appearance-none pr-8 cursor-pointer',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    )
  }
)

Select.displayName = 'Select'
