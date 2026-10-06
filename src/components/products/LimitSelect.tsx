import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { PRODUCT_LIMITS } from "@/types/products.types";
import { cn } from "@/lib/utils";

interface LimitSelectProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

export function LimitSelect({ value, onChange, className }: LimitSelectProps) {
  const handleChange = (v: string | null) => {
    if (v === null) return;
    onChange(Number(v));
  };

  return (
    <div
      className={cn("flex items-center gap-2 w-full justify-end", className)}
    >
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        Itens por página:
      </span>

      <Select value={String(value)} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          {LIMIT_OPTIONS.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
