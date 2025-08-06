"use client"

import * as React from "react"
import { Button } from "./Button"
import { CheckIcon, ChevronsUpDown, ChevronsUpDownIcon } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"
import { cn } from "~/utils/utils"

type Option = {
  value: string;
  label: string;
};

type ComboboxProps = {
  options: Option[];
  name: string;
  value: string;
  onInput: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  autoComplete?: string;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  required?: boolean;
  disabled?: boolean;
  // 👇 Новый пропс
  id?: string;
};

export function Combobox({ name, onInput, options, value, autoComplete, disabled, emptyMessage, enterKeyHint, id, placeholder, required }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const handleSelect = (newValue: string) => {
    onInput(newValue); // ← conform слушает `onInput`
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          // ✅ Привязываем id
          id={id}
          // или, если id не передан — генерируем
          // но лучше передавать извне
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedOption ? selectedOption.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}