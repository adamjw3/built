"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Define the navigation item type
type NavItem = {
  label: string
  url: string
}

type SectionNavigationProps = {
  items: NavItem[]
}

export function SectionNavigation({ items }: SectionNavigationProps) {
  const pathname = usePathname()
  
  return (
    <nav className="flex overflow-x-auto border-b w-full">
      <ul className="flex space-x-1 w-full">
        {items.map((item) => (
          <li key={item.url}>
            <Link 
              href={item.url}
              className={cn(
                "flex h-10 items-center px-4 text-sm font-medium transition-colors hover:text-primary",
                pathname === item.url 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}