"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Mail, Users } from "lucide-react"

export function NavTabs() {
    const pathname = usePathname()

    const tabs = [
        {
            name: "Newsletters",
            href: "/dashboard",
            icon: Mail,
            active: pathname === "/dashboard",
        },
        {
            name: "Publishers",
            href: "/publishers",
            icon: Users,
            active: pathname === "/publishers",
        },
    ]

    return (
        <nav className="flex items-center gap-1 rounded-lg bg-muted p-1">
            {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                            tab.active
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.name}</span>
                    </Link>
                )
            })}
        </nav>
    )
}
