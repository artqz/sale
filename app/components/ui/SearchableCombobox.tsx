import * as React from "react";
import { useSearch } from "~/hooks/useSearch";
import { Button } from "./Button";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { cn } from "~/utils/common";
import { Spinner } from "../Spinner";

type SearchableComboboxProps = {
  name: string;
  value: string;
  onChange: (value: string) => void;
  searchType: "users" | "documents";
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function SearchableCombobox({
  name,
  value,
  onChange,
  searchType,
  placeholder = "Выберите...",
  searchPlaceholder = "Поиск...",
  emptyMessage = "Ничего не найдено",
  required,
  disabled,
  id,
  className,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { query, setQuery, results, isLoading, error } = useSearch(searchType);

  const selectedOption = React.useMemo(() => {
    return results.find((opt) => opt.value === value);
  }, [results, value]);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
    setQuery("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setQuery("");
    }
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            id={id}
            className="w-full justify-between"
            disabled={disabled}
          >
            {selectedOption ? selectedOption.label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center">
                  <Spinner />
                  <span className="ml-2 text-sm text-gray-500">Поиск...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {results.map((option) => (
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
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && (
        <div className="mt-1 text-sm text-red-600">
          Ошибка поиска: {error}
        </div>
      )}
    </div>
  );
}