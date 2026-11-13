// src/components/print/PrintPortal.tsx
import { createPortal } from "react-dom";

/**
 * 🔹 Renderiza children no #print-portal-root (filho direto do <body>).
 * Sem state, sem effect — o container já existe no index.html.
 * Evita herdar containers com max-w-*, overflow-*, mx-auto da página.
 */
export function PrintPortal({ children }: { children: React.ReactNode }) {
  const container = document.getElementById("print-portal-root");
  if (!container) return null;
  return createPortal(children, container);
}
