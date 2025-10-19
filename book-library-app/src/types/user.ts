import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  name: string
  photoUrl?: string
  preferences: UserPreferences
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  emailNotifications: boolean
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}