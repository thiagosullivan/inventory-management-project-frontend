// src/components/auth/EmailVerificationBanner.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerificationOtp } from "@/services/email-otp";

export function EmailVerificationBanner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!user || user.emailVerified) return null;

  async function handleResend() {
    if (!user || countdown > 0) return;
    setResending(true);
    try {
      await sendEmailVerificationOtp(user.email);
      toast.success("Novo código enviado.");
      setCountdown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao reenviar.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="shrink-0" />
        <span>Confirme seu e-mail para garantir a segurança da conta.</span>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate("/verificar-email")}
          className="cursor-pointer"
        >
          Verificar agora
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="cursor-pointer"
        >
          {countdown > 0 ? `${countdown}s` : "Reenviar"}
        </Button>
      </div>
    </div>
  );
}
