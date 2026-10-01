/** Entidade completa — usada na página /categories futuramente. */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 🔹 Opção genérica de select.
 * Formato `{ label, value }` — o que o shadcn/Radix espera.
 * Reusável em qualquer dropdown (categoria, usuário, localização...).
 */
export interface SelectOption {
  label: string;
  value: string;
}
