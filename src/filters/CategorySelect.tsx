import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";

interface CategorySelectProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

const ALL_VALUE = "__all__";

// 🔹 Select de categoria — uma escolha por vez
export function CategorySelect({
  value,
  onChange,
  placeholder = "Todas as categorias",
  className,
}: CategorySelectProps) {
  const { options, isLoading, isError } = useCategories();

  const internalValue = value ?? ALL_VALUE;

  const selectedOption = value
    ? options.find((opt) => opt.value === value)
    : { label: placeholder, value: ALL_VALUE };

  const handleChange = (v: string | null) => {
    if (v === null) return;
    onChange(v === ALL_VALUE ? undefined : v);
  };

  if (isError) {
    return (
      <Select disabled value={ALL_VALUE}>
        <SelectTrigger className={cn("w-full sm:w-[200px]", className)}>
          <SelectValue
            className="text-muted-foreground"
            placeholder="Erro ao carregar"
          />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={internalValue} onValueChange={handleChange}>
      <SelectTrigger
        className={cn("w-full sm:w-[200px] text-muted-foreground", className)}
        disabled={isLoading}
      >
        {/* 🔹 children como fallback: label se achou, placeholder se não */}
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={ALL_VALUE} className="text-muted-foreground">
          {placeholder}
        </SelectItem>

        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="text-muted-foreground"
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
