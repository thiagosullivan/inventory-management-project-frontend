import { Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 400,
  isLoading = false,
  className,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
  }

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setInputValue("");
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className="absolute top-1/2 -translate-y-1/2 left-4 text-muted-foreground pointer-events-none"
        size={24}
      />

      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pr-9 h-12.5 rounded-lg pl-11 text-muted-foreground"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {isLoading ? (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-label="Buscando..."
          />
        ) : inputValue ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Limpar busca"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
