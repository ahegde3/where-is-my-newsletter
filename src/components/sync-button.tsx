"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false)

  function handleSync() {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      toast.success("Synced 3 new newsletters", {
        description: "Your inbox is up to date.",
      })
    }, 1500)
  }

  return (
    <Button
      onClick={handleSync}
      disabled={isSyncing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
      {isSyncing ? "Syncing..." : "Sync"}
    </Button>
  )
}
