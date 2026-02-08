"use client"

import { signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut } from "lucide-react"

export function SignInButton() {
  return (
    <Button
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      size="lg"
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign in with Google
    </Button>
  )
}

export function SignOutButton() {
  return (
    <Button
      onClick={() => signOut({ callbackUrl: "/" })}
      variant="ghost"
      size="sm"
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </Button>
  )
}
