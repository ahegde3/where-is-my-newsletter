"use client"

import { useMockAuth } from "@/lib/mock-auth"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export function SignInButton() {
  const { signIn, isLoading } = useMockAuth()

  return (
    <Button onClick={signIn} disabled={isLoading} size="lg" className="gap-2">
      <LogIn className="h-4 w-4" />
      {isLoading ? "Signing in..." : "Sign in with Google"}
    </Button>
  )
}

export function SignOutButton() {
  const { signOut } = useMockAuth()

  return (
    <Button onClick={signOut} variant="ghost" size="sm" className="gap-2">
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}
