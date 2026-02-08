"use client"

import { createContext, useContext, useState, useCallback } from "react"
import type { ReactNode } from "react"

interface MockUser {
  name: string
  email: string
  image: string
}

interface MockAuthContextValue {
  user: MockUser | null
  isLoading: boolean
  signIn: () => void
  signOut: () => void
}

const MOCK_USER: MockUser = {
  name: "Anish Dev",
  email: "anish@example.com",
  image: "https://api.dicebear.com/9.x/initials/svg?seed=AD",
}

const MockAuthContext = createContext<MockAuthContextValue | undefined>(undefined)

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      setUser(MOCK_USER)
      setIsLoading(false)
    }, 500)
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <MockAuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useMockAuth() {
  const context = useContext(MockAuthContext)
  if (!context) throw new Error("useMockAuth must be used within MockAuthProvider")
  return context
}
