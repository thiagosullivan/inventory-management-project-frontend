// src/pages/VerifyEmailPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/services/auth";
import { sendEmailVerificationOtp, verifyEmailOtp } from "@/services/email-otp";
import { ArrowLeft } from "lucide-react";

export default function VerifyEmailPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!user) return;
    if (user.emailVerified) {
      toast.info("Seu e-mail já está verificado.");
      navigate("/minha-conta", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleVerify() {
    if (!user || otp.length !== 6) return;
    setLoading(true);
    try {
      await verifyEmailOtp(user.email, otp);
      const result = await getMe();
      if (result.status === "ok") setUser(result.user);
      toast.success("E-mail verificado com sucesso!");
      navigate("/minha-conta", { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

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
    <div className="mx-auto max-w-md space-y-6 px-4 py-8">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Voltar
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-primary">Confirmar e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Enviamos um código de 6 dígitos para <strong>{user?.email}</strong>.
        </p>
      </div>

      <InputOTP maxLength={6} value={otp} onChange={setOtp} pattern="^[0-9]+$">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6}
          className="cursor-pointer"
        >
          {loading ? "Verificando..." : "Verificar"}
        </Button>
        <Button
          variant="outline"
          onClick={handleResend}
          disabled={resending || countdown > 0}
          className="cursor-pointer"
        >
          {countdown > 0 ? `Reenviar em ${countdown}s` : "Reenviar código"}
        </Button>
      </div>
    </div>
  );
}
