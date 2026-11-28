// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getMe } from "../services/auth";
import { getSocket } from "../lib/socket";
import type { User } from "../types/auth.types";
import type { Notification } from "../types/notification.types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | undefined>(undefined);

  // 🔹 Limpa todo o cache do React Query ao deslogar ou trocar de conta
  useEffect(() => {
    const currentUserId = user?.id;
    if (prevUserIdRef.current !== currentUserId) {
      qc.clear();
      prevUserIdRef.current = currentUserId;
    }
  }, [user?.id, qc]);

  // 🔹 Carrega /me uma vez
  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((result) => {
        if (cancelled) return;

        if (result.status === "ok") {
          setUser(result.user);
          return;
        }

        if (result.status === "inactive") {
          setUser({ isActive: false } as User);
          return;
        }

        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // 🔹 Fase 8 — Socket.io (conecta quando autenticado ativo)
  useEffect(() => {
    if (!user || user.isActive === false) return;

    const socket = getSocket();

    function handleNew(notification: Notification) {
      qc.invalidateQueries({ queryKey: ["notifications"] });

      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        toast.info(notification.title, {
          description: notification.message,
          action: notification.link
            ? {
                label: "Ver",
                onClick: () => {
                  window.location.href = notification.link as string;
                },
              }
            : undefined,
        });
      }
    }

    socket.on("notification:new", handleNew);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("notification:new", handleNew);
      socket.disconnect();
    };
  }, [user, qc]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
