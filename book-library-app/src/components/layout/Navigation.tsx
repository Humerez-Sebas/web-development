'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const Navigation = () => {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/me/wishlist', label: 'Wishlist' },
    { href: '/me/loans', label: 'My Loans' },
    { href: '/me/profile', label: 'Profile' },
  ]

  return (
    <nav className="flex space-x-6">
      {links.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isActive
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}