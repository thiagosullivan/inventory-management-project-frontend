import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    // 1. Função de inscrição (subscribe)
    (callback) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", callback);

      return () => mediaQueryList.removeEventListener("change", callback);
    },
    // 2. Como obter o valor no cliente (browser)
    () => window.matchMedia(query).matches,
    // 3. Valor padrão para o servidor (SSR/Hydration) se aplicável
    () => false,
  );
}
