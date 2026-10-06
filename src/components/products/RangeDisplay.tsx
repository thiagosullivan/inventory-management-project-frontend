import { cn } from "@/lib/utils";

interface RangeDisplayProps {
  page: number;
  limit: number;
  total: number;
  itemLabel?: string;
  className?: string;
}

export function RangeDisplay({
  page,
  limit,
  total,
  itemLabel = "produtos",
  className,
}: RangeDisplayProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const rangeText = start === end ? `${start}` : `${start}–${end}`;

  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      Mostrando {rangeText} de {total} {itemLabel}
    </span>
  );
}
