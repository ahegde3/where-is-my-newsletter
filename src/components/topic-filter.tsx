"use client"

import { cn } from "@/lib/utils"
import { ALL_TOPICS, TOPIC_COLORS, type Topic } from "@/lib/mock-data"

interface TopicFilterProps {
  activeTopic: string | null
  onTopicChange: (topic: string | null) => void
  availableTopics?: readonly string[]
}

export function TopicFilter({
  activeTopic,
  onTopicChange,
  availableTopics = ALL_TOPICS,
}: TopicFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTopicChange(null)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          !activeTopic
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All
      </button>
      {availableTopics.map((topic) => {
        const isActive = activeTopic === topic
        const colorClass = TOPIC_COLORS[topic as Topic]
        return (
          <button
            key={topic}
            onClick={() => onTopicChange(isActive ? null : topic)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
              isActive
                ? colorClass || "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {topic}
          </button>
        )
      })}
    </div>
  )
}
