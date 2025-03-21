"use client"
import { useState } from "react"
import { ClientForm } from "@/components/clients/client-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type ClientModalProps = {
  trigger: React.ReactNode;
  onSuccess?: () => void;
}

export function ClientModal({ trigger, onSuccess }: ClientModalProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    // Call the onSuccess callback if provided
    if (onSuccess) {
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-xl">Add new client</DialogTitle>
        </DialogHeader>
        <div className="pt-2">
          <ClientForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}