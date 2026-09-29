import { cn } from "@/lib/utils";

export interface TriStateOption<T extends string | boolean | undefined> {
  label: string;
  value: T;
}

interface TriStateToggleProps<T extends string | boolean | undefined> {
  options: TriStateOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function TriStateToggle<T extends string | boolean | undefined>({
  options,
  value,
  onChange,
  className,
}: TriStateToggleProps<T>) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center rounded-md border border-input bg-background p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
            className={cn(
              "px-3 py-1 text-sm rounded-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
