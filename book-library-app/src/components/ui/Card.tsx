import { FC, ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export const Card: FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  onClick,
}) => {
  const hoverClass = hoverable
    ? 'hover:shadow-lg cursor-pointer transform transition-transform hover:-translate-y-1'
    : ''
  
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}