import { cn } from "@/lib/utils";

interface BooleanToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean | undefined) => void;
  className?: string;
}

export function BooleanToggle({
  label,
  checked,
  onCheckedChange,
  className,
}: BooleanToggleProps) {
  const handleClick = () => {
    onCheckedChange(checked ? undefined : true);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={checked}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
        checked
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground",
        className,
      )}
    >
      {label}
    </button>
  );
}
