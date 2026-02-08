"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMockAuth } from "@/lib/mock-auth"
import { MOCK_NEWSLETTERS } from "@/lib/mock-data"
import { SignOutButton } from "@/components/auth-button"
import { SyncButton } from "@/components/sync-button"
import { TopicFilter } from "@/components/topic-filter"
import { ReadFilter } from "@/components/read-filter"
import { NewsletterList } from "@/components/newsletter-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Mail } from "lucide-react"
import type { NewsletterWithPublisher, ReadFilter as ReadFilterType } from "@/types"

export default function DashboardPage() {
  const { user } = useMockAuth()
  const router = useRouter()
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [readFilter, setReadFilter] = useState<ReadFilterType>("all")
  const [newsletters, setNewsletters] = useState<NewsletterWithPublisher[]>(MOCK_NEWSLETTERS)

  useEffect(() => {
    if (!user) router.replace("/")
  }, [user, router])

  const handleToggleRead = useCallback((id: string) => {
    setNewsletters((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )
  }, [])

  const filteredNewsletters = useMemo(() => {
    return newsletters.filter((n) => {
      if (activeTopic && !n.topics.includes(activeTopic)) return false
      if (readFilter === "read" && !n.isRead) return false
      if (readFilter === "unread" && n.isRead) return false
      return true
    })
  }, [newsletters, activeTopic, readFilter])

  const availableTopics = useMemo(() => {
    const topics = new Set(newsletters.flatMap((n) => n.topics))
    return Array.from(topics).sort()
  }, [newsletters])

  const readCounts = useMemo(() => ({
    all: newsletters.length,
    read: newsletters.filter((n) => n.isRead).length,
    unread: newsletters.filter((n) => !n.isRead).length,
  }), [newsletters])

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold tracking-tight">
              Where Is My Newsletter
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SyncButton />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className="text-xs">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block">
                {user.name}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Newsletters</h1>
            <p className="text-sm text-muted-foreground">
              {newsletters.length} total &middot;{" "}
              {filteredNewsletters.length} shown
            </p>
          </div>
          <ReadFilter
            activeFilter={readFilter}
            onFilterChange={setReadFilter}
            counts={readCounts}
          />
        </div>

        <div className="mb-6">
          <TopicFilter
            activeTopic={activeTopic}
            onTopicChange={setActiveTopic}
            availableTopics={availableTopics}
          />
        </div>

        <NewsletterList
          newsletters={filteredNewsletters}
          onToggleRead={handleToggleRead}
        />
      </main>
    </div>
  )
}
