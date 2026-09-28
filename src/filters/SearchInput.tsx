import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  /** Valor atual (vem de fora — URL, estado do pai, etc.). */
  value: string;
  /**
   * Chamado com o valor já debounced.
   * Recebe string vazia quando o usuário limpa (o pai decide virar undefined ou "").
   */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Delay do debounce em ms. Default 400. */
  debounceMs?: number;
  className?: string;
}

/**
 * Input de busca com debounce interno.
 *
 * Genérico: não sabe nada de URL nem de qual entidade está sendo buscada.
 * Quem usa passa `value` + `onChange` + `placeholder`.
 *
 * Comportamento:
 * - O input é responsivo (estado local atualiza a cada tecla).
 * - O `onChange` externo só dispara depois do debounce.
 * - Se `value` mudar externamente (ex: back/forward, "limpar filtros"),
 *   o estado local sincroniza — ajustando durante o render, sem effect.
 */
// 🔹 Input de busca genérico, com debounce e botão de limpar
export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 400,
  className,
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Sincroniza mudanças externas durante o render (padrão oficial do React).
  // Evita effect + setState em cascata.
  // 🔹 Ajuste de estado durante o render — não é effect
  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value);
  }

  // Propaga o valor debounced pra fora
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleClear = () => {
    setInputValue("");
    // não chama onChange direto — deixa o debounce propagar
    // (evita corrida entre limpar local e limpar URL)
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />

      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
