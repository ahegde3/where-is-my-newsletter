"use client"

import { formatDistanceToNow } from "date-fns"
import { ExternalLink, Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { TOPIC_COLORS, type Topic } from "@/lib/mock-data"
import type { Newsletter } from "@/types"

interface NewsletterCardProps {
  newsletter: Newsletter
  onToggleRead: (id: string) => void
}

export function NewsletterCard({ newsletter, onToggleRead }: NewsletterCardProps) {
  const timeAgo = formatDistanceToNow(newsletter.receivedAt, { addSuffix: true })

  return (
    <Card className={cn(
      "transition-shadow hover:shadow-md",
      newsletter.isRead && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="pt-0.5">
            <Checkbox
              checked={newsletter.isRead}
              onCheckedChange={() => onToggleRead(newsletter.id)}
              aria-label={`Mark "${newsletter.subject}" as ${newsletter.isRead ? "unread" : "read"}`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="font-medium text-foreground">
                {newsletter.senderName}
              </span>
              <span className="truncate">{newsletter.sender}</span>
            </div>
            <h3 className={cn(
              "mt-1.5 leading-snug",
              newsletter.isRead
                ? "font-medium text-muted-foreground"
                : "font-semibold"
            )}>
              {newsletter.subject}
            </h3>
          </div>
          <time className="shrink-0 text-xs text-muted-foreground">
            {timeAgo}
          </time>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pl-[3.25rem]">
        {newsletter.summary && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {newsletter.summary}
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {newsletter.topics.map((topic) => (
              <Badge
                key={topic}
                variant="secondary"
                className={cn(
                  "text-[10px] capitalize",
                  TOPIC_COLORS[topic as Topic]
                )}
              >
                {topic}
              </Badge>
            ))}
          </div>
          {newsletter.viewInBrowserLink && (
            <Button variant="ghost" size="sm" className="shrink-0 gap-1.5" asChild>
              <a
                href={newsletter.viewInBrowserLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
