import type { NewsletterWithPublisher } from "@/types"
import { NewsletterCard } from "@/components/newsletter-card"
import { Inbox } from "lucide-react"

interface NewsletterListProps {
  newsletters: NewsletterWithPublisher[]
  onToggleRead: (id: string) => void
}

export function NewsletterList({ newsletters, onToggleRead }: NewsletterListProps) {
  if (newsletters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Inbox className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No newsletters found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different filter or sync your inbox.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {newsletters.map((newsletter) => (
        <NewsletterCard
          key={newsletter.id}
          newsletter={newsletter}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  )
}
