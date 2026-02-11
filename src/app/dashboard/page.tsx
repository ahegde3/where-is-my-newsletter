"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SignOutButton } from "@/components/auth-button"
import { SyncButton } from "@/components/sync-button"
import { NavTabs } from "@/components/nav-tabs"
import { TopicFilter } from "@/components/topic-filter"
import { ReadFilter } from "@/components/read-filter"
import { NewsletterList } from "@/components/newsletter-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail } from "lucide-react"
import type { NewsletterWithPublisher, ReadFilter as ReadFilterType } from "@/types"
import { getNewsletters } from "@/actions/newsletters"
import { syncNewsletters } from "@/actions/sync"
import { toast } from "sonner"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTopic, setActiveTopic] = useState<string | null>(null)
  const [readFilter, setReadFilter] = useState<ReadFilterType>("all")
  const [newsletters, setNewsletters] = useState<NewsletterWithPublisher[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch newsletters on mount and when topic changes
  const fetchNewsletters = useCallback(async () => {
    try {
      setIsLoading(true)
      // Since our server action filters by topic, we could pass it here. 
      // But for client-side filtering familiarity (and small data size MVP), let's fetch all 
      // or fetch by topic if we want server-side filtering. 
      // Let's do client-side filtering on the fetched set for "read/unread" 
      // but maybe server-side for topic if data grows. 
      // For MVP, let's fetch all relevant to the user for now to make "all topics" view fast.
      // Wait, getNewsletters accepts a topic. Let's start with fetching all.
      // Actually, let's just fetch all recent ones.
      const data = await getNewsletters()

      // Transform DB data to UI type
      const transformed: NewsletterWithPublisher[] = data.map(n => ({
        id: n.id,
        publisher: {
          id: n.publisher.id,
          userId: n.publisher.userId,
          name: n.publisher.name,
          email: n.publisher.email,
          createdAt: new Date(n.publisher.createdAt),
        },
        userId: n.userId,
        publisherId: n.publisherId,
        messageId: n.messageId,
        subject: n.subject,
        plainText: n.plainText,
        summary: n.summary,
        receivedAt: new Date(n.receivedAt),
        processedAt: n.processedAt,
        createdAt: n.createdAt,
        isRead: n.isRead,
        topics: n.topics || [],
        link: n.link,
      }))
      setNewsletters(transformed)
    } catch (error) {
      console.error("Failed to fetch newsletters", error)
      toast.error("Failed to load newsletters")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchNewsletters()
    } else if (status === "unauthenticated") {
      router.replace("/")
    }
  }, [status, router, fetchNewsletters])

  const handleSync = async () => {
    try {
      const result = await syncNewsletters({})
      if (result?.data) {
        toast.success(`Synced ${result.data.synced} new newsletters`, {
          id: "sync-toast" // dedupe
        })
        if (result.data.synced > 0) {
          await fetchNewsletters()
        }
      } else if (result?.serverError) {
        toast.error("Sync failed: " + result.serverError)
      }
    } catch (error) {
      console.error("Sync error", error)
      toast.error("Failed to sync newsletters")
    }
  }

  const handleToggleRead = useCallback(async (id: string) => {
    // Optimistic update
    setNewsletters((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    )

    // Find new status
    const newsletter = newsletters.find(n => n.id === id);
    if (!newsletter) return;
    const newStatus = !newsletter.isRead;

    try {
      await import("@/actions/newsletters").then(mod => mod.toggleReadStatus(id, newStatus));
    } catch (err) {
      console.error("Failed to toggle read status", err);
      toast.error("Failed to update status");
      // Revert
      setNewsletters((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
      )
    }
  }, [newsletters])

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

  if (status === "loading" || (isLoading && newsletters.length === 0)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">
          <Skeleton className="mb-2 h-8 w-40" />
          <Skeleton className="mb-6 h-4 w-56" />
          <div className="mb-6 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-16 rounded-full" />
            ))}
          </div>
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!session?.user) return null

  const user = session.user

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold tracking-tight">
                Where Is My Newsletter
              </span>
            </div>
            <NavTabs />
          </div>
          <div className="flex items-center gap-3">
            <SyncButton onSync={handleSync} />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
                <AvatarFallback className="text-xs">
                  {(user.name ?? "U")
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
