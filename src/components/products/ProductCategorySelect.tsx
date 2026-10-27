import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface ProductCategorySelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function ProductCategorySelect({
  value,
  onChange,
  placeholder = "Selecione uma categoria",
  className,
  disabled,
}: ProductCategorySelectProps) {
  const { options, isLoading, isError } = useCategories();

  const selectedOption = value
    ? options.find((opt) => opt.value === value)
    : undefined;

  const handleChange = (v: string | null) => {
    if (v === null) return;
    onChange(v);
  };

  if (isError) {
    return (
      <Select disabled value={undefined}>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder="Erro ao carregar categorias" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      value={value ?? undefined}
      onValueChange={handleChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="font-mono text-xs text-muted-foreground mr-2">
              {opt.prefix}
            </span>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
