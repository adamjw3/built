"use client"

import { useState } from "react"
import { X, Users } from "lucide-react"
import { ClientForm } from "@/components/clients/client-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ClientModalProps = {
  trigger: React.ReactNode
}

export function ClientModal({ trigger }: ClientModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl">Add new client</DialogTitle>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Add Multiple Clients
            </Button>
          </div>
        </DialogHeader>
        <div className="pt-2">
          <ClientForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}