import { useState, useEffect } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api-error";

interface ResendOtpButtonProps {
  email: string;
}

export function ResendOtpButton({ email }: ResendOtpButtonProps) {
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);

  // countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || sending) return;

    try {
      setSending(true);
      await api.post("/auth/email-otp/request-password-reset", { email });
      toast.success("Novo código enviado para seu e-mail.");
      setCooldown(60);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao reenviar código."));
    } finally {
      setSending(false);
    }
  }

  const disabled = cooldown > 0 || sending;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleResend}
      disabled={disabled}
      className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
    >
      {sending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <RotateCcw className="mr-2 h-4 w-4" />
      )}
      {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
    </Button>
  );
}
