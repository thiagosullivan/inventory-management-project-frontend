import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";

interface UserSelectProps {
  /** ID do usuário selecionado, ou undefined pra "todos". */
  value: string | undefined;
  /** Chamado com o ID do usuário ou undefined (quando "todos"). */
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  className?: string;
}

/** Valor sentinela pra "todos os usuários". */
// 🔹 O shadcn Select não aceita value vazio, então usamos um sentinela
const ALL_VALUE = "__all__";

/**
 * Select de usuários com agrupamento Ativos / Desativados.
 *
 * Genérico: não sabe de URL nem que está filtrando produtos.
 * Só recebe um `value` (id) e devolve `onChange` (id | undefined).
 *
 * Usa `useUsers()` pra popular as opções (endpoint /admin/users/options).
 */
// 🔹 Select de usuário — uma escolha por vez, com grupos
export function UserSelect({
  value,
  onChange,
  placeholder = "Todos os usuários",
  className,
}: UserSelectProps) {
  const { options, isLoading, isError } = useUsers();

  // Separa em dois grupos pra renderização
  const activeOptions = options.filter((opt) => opt.isActive);
  const inactiveOptions = options.filter((opt) => !opt.isActive);

  // 🔹 Acha a option selecionada (ativa ou inativa) pra mostrar o label no trigger.
  //    O Radix não faz isso sozinho quando as options chegam depois do value.
  const selectedOption = value
    ? options.find((opt) => opt.value === value)
    : { label: placeholder, value: ALL_VALUE };

  const internalValue = value ?? ALL_VALUE;

  const handleChange = (v: string | null) => {
    if (v === null) return;
    onChange(v === ALL_VALUE ? undefined : v);
  };

  if (isError) {
    return (
      <Select disabled value={ALL_VALUE}>
        <SelectTrigger className={cn("w-full sm:w-[200px]", className)}>
          <SelectValue placeholder="Erro ao carregar" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={internalValue} onValueChange={handleChange}>
      <SelectTrigger
        className={cn("w-full sm:w-[200px]", className)}
        disabled={isLoading}
      >
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder}>
          {selectedOption?.label}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value={ALL_VALUE}>{placeholder}</SelectItem>

        {activeOptions.length > 0 && (
          <SelectGroup>
            <SelectLabel>Ativos</SelectLabel>
            {activeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}

        {inactiveOptions.length > 0 && (
          <SelectGroup>
            <SelectLabel>Desativados</SelectLabel>
            {inactiveOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
