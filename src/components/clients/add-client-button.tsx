"use client"

import { Button } from "@/components/ui/button"
import { ClientModal } from "@/components/clients/client-modal"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface AddClientButtonProps {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function AddClientButton({
  variant = "default",
  size = "default",
  className,
}: AddClientButtonProps) {
  const router = useRouter();

  const handleSuccess = () => {
    console.log("Client added successfully, refreshing page...")
    // Force a complete refresh of the page data
    router.refresh()
  }

  return (
    <ClientModal
      trigger={
        <Button variant={variant} size={size} className={className}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      }
      onSuccess={handleSuccess}
    />
  )
}