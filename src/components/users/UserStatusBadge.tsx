import { Badge } from "@/components/ui/badge";

interface UserStatusBadgeProps {
  isActive: boolean;
}

export function UserStatusBadge({ isActive }: UserStatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? "default" : "secondary"}
      className={
        isActive
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
          : "bg-muted text-muted-foreground hover:bg-muted"
      }
    >
      {isActive ? "Ativo" : "Inativo"}
    </Badge>
  );
}