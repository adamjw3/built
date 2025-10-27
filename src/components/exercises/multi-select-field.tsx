"use client"

import { useState } from "react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/components/ui/shadcn-io/combobox'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface MultiSelectFieldProps {
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  placeholder: string
  type: string
}

export function MultiSelectField({
  value,
  onChange,
  options,
  placeholder,
  type
}: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter(v => v !== selectedValue)
      : [...value, selectedValue]
    onChange(newValue)
  }

  const removeItem = (itemToRemove: string) => {
    onChange(value.filter(v => v !== itemToRemove))
  }

  return (
    <div className="space-y-2">
      <Combobox
        data={options?.map(option => ({ label: option, value: option })) || []}
        onOpenChange={setOpen}
        onValueChange={handleSelect}
        open={open}
        value=""
        type={type}
      >
        <ComboboxTrigger className="w-full justify-start">
          {value.length > 0 ? `${value.length} selected` : placeholder}
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxEmpty />
          <ComboboxList>
            <ComboboxGroup>
              {options?.map((option) => (
                <ComboboxItem key={option} value={option}>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value.includes(option)}
                      readOnly
                    />
                    <span>{option}</span>
                  </div>
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">
              {item}
              <button
                type="button"
                className="ml-1 hover:text-destructive"
                onClick={() => removeItem(item)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
