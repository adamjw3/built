import { Label } from '@/components/ui/label'
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

interface FilterComboboxProps {
  label: string
  type: string
  data: string[] | { label: string; value: string }[]
  value: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onValueChange: (value: string) => void
  width?: string
}

export function FilterCombobox({
  label,
  type,
  data,
  value,
  open,
  onOpenChange,
  onValueChange,
  width = "w-[200px]"
}: FilterComboboxProps) {
  // Normalize data to always be an array of objects with label/value
  const normalizedData = Array.isArray(data)
    ? data.map(item =>
        typeof item === 'string'
          ? { label: item, value: item }
          : item
      )
    : []

  return (
    <div className="flex flex-col space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      <Combobox
        data={normalizedData}
        onOpenChange={onOpenChange}
        onValueChange={onValueChange}
        open={open}
        value={value}
        type={type}
      >
        <ComboboxTrigger className={width} />
        <ComboboxContent>
          <ComboboxInput />
          <ComboboxEmpty />
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxItem className="w-full" value="">
                All
              </ComboboxItem>
              {normalizedData.map((item) => (
                <ComboboxItem className="w-full" key={item.value} value={item.value}>
                  {item.label}
                </ComboboxItem>
              ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}
