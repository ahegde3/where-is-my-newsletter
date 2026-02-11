"use client"

import { useState } from "react"
import { createPublisher } from "@/actions/publishers"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface PublisherFormProps {
    onSuccess?: () => void
}

export function PublisherForm({ onSuccess }: PublisherFormProps) {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.trim()) {
            toast.error("Email is required")
            return
        }

        setIsSubmitting(true)

        try {
            const result = await createPublisher(name, email)

            if (result.success) {
                toast.success("Publisher added successfully")
                setName("")
                setEmail("")
                onSuccess?.()
            } else {
                toast.error(result.error || "Failed to add publisher")
            }
        } catch (error) {
            console.error("Failed to create publisher:", error)
            toast.error("Failed to add publisher")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Publisher Name</Label>
                <Input
                    id="name"
                    type="text"
                    placeholder="e.g., TechCrunch"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="e.g., newsletter@techcrunch.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Adding..." : "Add Publisher"}
            </Button>
        </form>
    )
}
