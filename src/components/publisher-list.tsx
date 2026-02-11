"use client"

import { useState } from "react"
import { deletePublisher } from "@/actions/publishers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Trash2 } from "lucide-react"
import { toast } from "sonner"
import type { Publisher } from "@/types"

interface PublisherListProps {
    publishers: Publisher[]
    onDelete?: () => void
}

export function PublisherList({ publishers, onDelete }: PublisherListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this publisher?")) {
            return
        }

        setDeletingId(id)

        try {
            const result = await deletePublisher(id)

            if (result.success) {
                toast.success("Publisher deleted successfully")
                onDelete?.()
            } else {
                toast.error(result.error || "Failed to delete publisher")
            }
        } catch (error) {
            console.error("Failed to delete publisher:", error)
            toast.error("Failed to delete publisher")
        } finally {
            setDeletingId(null)
        }
    }

    if (publishers.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-center text-sm text-muted-foreground">
                        No publishers yet. Add your first publisher above.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publishers.map((publisher) => (
                <Card key={publisher.id}>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <CardTitle className="text-base truncate">
                                    {publisher.name || "Unnamed Publisher"}
                                </CardTitle>
                                <CardDescription className="truncate">
                                    {publisher.email}
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(publisher.id)}
                                disabled={deletingId === publisher.id}
                            >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete publisher</span>
                            </Button>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    )
}
