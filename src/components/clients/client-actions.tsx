"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useClientActions } from "@/lib/hooks/use-clients"

const menuItems = [
  {
    value: "Archive",
    label: "Archive",
  },
  {
    value: "Delete",
    label: "Delete",
  }
]

export function ClientActions({ selectedClients, setSelectedClients }) {
  const [open, setOpen] = useState(false)
  const { deleteClients, archiveClients } = useClientActions()

  const onAction = async (action) => {
    if (action === "Delete") {
      deleteClients.mutate(selectedClients, {
        onSuccess: () => {
          setSelectedClients([])
          setOpen(false)
        }
      })
    }

    if (action === "Archive") {
      archiveClients.mutate(selectedClients, {
        onSuccess: () => {
          setSelectedClients([])
          setOpen(false)
        }
      })
    }
  }
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={deleteClients.isPending || archiveClients.isPending}
        >
          {deleteClients.isPending 
            ? "Deleting..." 
            : archiveClients.isPending 
              ? "Archiving..." 
              : "Actions"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {menuItems.map((menuItem) => (
                <CommandItem
                  key={menuItem.value}
                  value={menuItem.value}
                  onSelect={() => {
                    onAction(menuItem.value)
                  }}
                >
                  {menuItem.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}