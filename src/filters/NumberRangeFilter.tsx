import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface NumberRangeFilterProps {
  /** Valor mínimo aplicado (da URL). */
  minValue: number | undefined;
  /** Valor máximo aplicado (da URL). */
  maxValue: number | undefined;
  /**
   * Chamado quando a dupla (min, max) muda e é válida.
   * Recebe `undefined` quando o filtro é removido.
   */
  onChange: (next: {
    min: number | undefined;
    max: number | undefined;
  }) => void;
  /** Delay do debounce em ms. Default 400. */
  debounceMs?: number;
  className?: string;
}

/**
 * Filtro de range numérico — duas caixas (min / max).
 *
 * Comportamento:
 * - Estado local é `string` (o usuário precisa poder digitar vazio, lixo, etc.)
 * - Debounce de 400ms antes de aplicar
 * - Valida: números não-negativos, e `min <= max` quando ambos preenchidos
 * - Inválido → não escreve na URL + mostra erro visual
 * - Vazio → remove o param correspondente (sem erro)
 *
 * Genérico: não sabe de URL nem de qual entidade está filtrando.
 */
// 🔹 Range numérico com debounce e validação min <= max
export function NumberRangeFilter({
  minValue,
  maxValue,
  onChange,
  debounceMs = 400,
  className,
}: NumberRangeFilterProps) {
  const [minInput, setMinInput] = useState(minValue?.toString() ?? "");
  const [maxInput, setMaxInput] = useState(maxValue?.toString() ?? "");

  // Sync externo (URL, clearFilters) — mesmo padrão do SearchInput
  const [prevMin, setPrevMin] = useState(minValue);
  const [prevMax, setPrevMax] = useState(maxValue);

  if (minValue !== prevMin) {
    setPrevMin(minValue);
    setMinInput(minValue?.toString() ?? "");
  }
  if (maxValue !== prevMax) {
    setPrevMax(maxValue);
    setMaxInput(maxValue?.toString() ?? "");
  }

  const debouncedMin = useDebounce(minInput, debounceMs);
  const debouncedMax = useDebounce(maxInput, debounceMs);

  // 🔹 Parse e validação
  const parse = (raw: string): number | undefined | "invalid" => {
    const trimmed = raw.trim();
    if (trimmed === "") return undefined;
    const n = Number(trimmed);
    if (Number.isNaN(n) || n < 0 || !Number.isFinite(n)) return "invalid";
    return n;
  };

  const parsedMin = parse(debouncedMin);
  const parsedMax = parse(debouncedMax);

  const minInvalid = parsedMin === "invalid";
  const maxInvalid = parsedMax === "invalid";

  const rangeInvalid =
    !minInvalid &&
    !maxInvalid &&
    typeof parsedMin === "number" &&
    typeof parsedMax === "number" &&
    parsedMin > parsedMax;

  const hasError = minInvalid || maxInvalid || rangeInvalid;

  // 🔹 Aplica na URL só quando válido
  useEffect(() => {
    if (hasError) return;

    const sameMin = parsedMin === minValue;
    const sameMax = parsedMax === maxValue;
    if (sameMin && sameMax) return;

    onChange({
      min: parsedMin, // 🔹 já é number | undefined aqui
      max: parsedMax, // 🔹 já é number | undefined aqui
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={minInput}
        onChange={(e) => setMinInput(e.target.value)}
        placeholder="Mín"
        aria-invalid={minInvalid || rangeInvalid}
        aria-label="Quantidade mínima"
        className={cn(
          "no-spinner w-[80px]",
          (minInvalid || rangeInvalid) &&
            "border-destructive focus-visible:ring-destructive",
        )}
      />

      <span className="text-muted-foreground text-sm">–</span>

      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={maxInput}
        onChange={(e) => setMaxInput(e.target.value)}
        placeholder="Máx"
        aria-invalid={maxInvalid || rangeInvalid}
        aria-label="Quantidade máxima"
        className={cn(
          "no-spinner w-[80px]",
          (maxInvalid || rangeInvalid) &&
            "border-destructive focus-visible:ring-destructive",
        )}
      />

      {rangeInvalid && (
        <span className="text-xs text-destructive whitespace-nowrap">
          Mín &gt; Máx
        </span>
      )}
    </div>
  );
}
