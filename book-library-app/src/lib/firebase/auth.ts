import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './init'
import { User } from '@/types'

const googleProvider = new GoogleAuthProvider()

export const registerWithEmail = async (
  email: string,
  password: string,
  name: string
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  const firebaseUser = credential.user

  await updateProfile(firebaseUser, { displayName: name })

  const userData: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    name,
    preferences: {
      theme: 'light',
      language: 'en',
      emailNotifications: true,
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  await setDoc(doc(db, 'users', firebaseUser.uid), userData)
  return userData
}

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  const userDoc = await getDoc(doc(db, 'users', credential.user.uid))
  
  if (!userDoc.exists()) {
    throw new Error('User data not found')
  }
  
  return userDoc.data() as User
}

export const loginWithGoogle = async (): Promise<User> => {
  const credential = await signInWithPopup(auth, googleProvider)
  const firebaseUser = credential.user
  
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  
  if (!userDoc.exists()) {
    const userData: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'User',
      photoUrl: firebaseUser.photoURL || undefined,
      preferences: {
        theme: 'light',
        language: 'en',
        emailNotifications: true,
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData)
    return userData
  }
  
  return userDoc.data() as User
}

export const logout = async (): Promise<void> => {
  await signOut(auth)
}

export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
  
  if (!userDoc.exists()) {
    return null
  }
  
  return userDoc.data() as User
}