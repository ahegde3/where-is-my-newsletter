"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SignInButton } from "@/components/auth-button"
import { Mail, Sparkles, Tag } from "lucide-react"

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session) router.replace("/dashboard")
  }, [session, router])

  if (status === "loading" || session) return null

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
          <span className="text-lg font-bold tracking-tight">
            Where Is My Newsletter
          </span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your newsletters,
            <br />
            <span className="text-muted-foreground">summarized.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Automatically fetch, summarize, and organize your email newsletters.
            Never miss the key takeaways again.
          </p>

          <div className="mt-8">
            <SignInButton />
          </div>

          <div className="mt-12 grid gap-4 text-left sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-card p-4 text-card-foreground"
              >
                <feature.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-2 font-medium">{feature.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Built with Next.js, LangGraph, and Gemini Flash.
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: "Auto-fetch",
    description: "Pull newsletters from Gmail with one click.",
    icon: Mail,
  },
  {
    title: "AI Summaries",
    description: "50-word summaries powered by Gemini Flash.",
    icon: Sparkles,
  },
  {
    title: "Smart Tags",
    description: "Auto-classify into topics like AI, finance, design.",
    icon: Tag,
  },
] as const
