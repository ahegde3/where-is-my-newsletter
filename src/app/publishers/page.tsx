"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SignOutButton } from "@/components/auth-button"
import { SyncButton } from "@/components/sync-button"
import { NavTabs } from "@/components/nav-tabs"
import { PublisherForm } from "@/components/publisher-form"
import { PublisherList } from "@/components/publisher-list"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail } from "lucide-react"
import { getPublishers } from "@/actions/publishers"
import { syncNewsletters } from "@/actions/sync"
import { toast } from "sonner"
import type { Publisher } from "@/types"

export default function PublishersPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [publishers, setPublishers] = useState<Publisher[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchPublishers = useCallback(async () => {
        try {
            setIsLoading(true)
            const data = await getPublishers()
            setPublishers(data)
        } catch (error) {
            console.error("Failed to fetch publishers", error)
            toast.error("Failed to load publishers")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === "authenticated") {
            fetchPublishers()
        } else if (status === "unauthenticated") {
            router.replace("/")
        }
    }, [status, router, fetchPublishers])

    const handleSync = async () => {
        try {
            const result = await syncNewsletters({})
            if (result?.data) {
                toast.success(`Synced ${result.data.synced} new newsletters`, {
                    id: "sync-toast",
                })
            } else if (result?.serverError) {
                toast.error("Sync failed: " + result.serverError)
            }
        } catch (error) {
            console.error("Sync error", error)
            toast.error("Failed to sync newsletters")
        }
    }

    if (status === "loading" || (isLoading && publishers.length === 0)) {
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
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Skeleton className="h-64 w-full rounded-xl lg:col-span-1" />
                        <Skeleton className="h-64 w-full rounded-xl lg:col-span-2" />
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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Publishers</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage newsletter publishers and their email addresses
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Add Publisher</CardTitle>
                            <CardDescription>
                                Add a new newsletter publisher to track
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PublisherForm onSuccess={fetchPublishers} />
                        </CardContent>
                    </Card>

                    <div className="lg:col-span-2">
                        <h2 className="mb-4 text-lg font-semibold">
                            Your Publishers ({publishers.length})
                        </h2>
                        <PublisherList publishers={publishers} onDelete={fetchPublishers} />
                    </div>
                </div>
            </main>
        </div>
    )
}
