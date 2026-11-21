// src/components/sectors/SectorStatusBadge.tsx
import { Badge } from "@/components/ui/badge";

export function SectorStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
          : "bg-zinc-200 text-zinc-800 border-zinc-300"
      }
    >
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}