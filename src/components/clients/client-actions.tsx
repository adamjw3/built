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
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"


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

export function ClientActions({selectedClients, setSelectedClients}) {
  const [open, setOpen] = useState(false)
  const supabase = createClient();
  const router = useRouter()


  const onAction = async (action) => {
    const { data: userData, error: authError } = await supabase.auth.getUser()
    
    if (authError || !userData?.user) {
      throw new Error('You must be logged in')
    }

    if(action === "Delete") {
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .in('id', selectedClients)
    }

    if(action === "Archive") {
        const { data, error } = await supabase
          .from('clients')
          .update({ status: 'Archive' })
          .in('id', selectedClients)
    }

    setSelectedClients([]);
    router.refresh()
  } 
 
 return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          Actions
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandGroup>
              {menuItems.map((menuItems) => (
                <CommandItem
                  key={menuItems.value}
                  value={menuItems.value}
                  onSelect={() => {
                    onAction(menuItems.value)
                  }}
                >
                  {menuItems.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}