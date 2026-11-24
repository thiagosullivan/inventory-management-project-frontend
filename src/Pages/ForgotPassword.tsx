// src/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, KeyRound, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { api } from "@/services/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useTheme } from "@/components/themeProvider";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";
import { ResendOtpButton } from "@/components/forgot-password/ResendOTPBtn";

// Etapa 1 — e-mail
const emailSchema = z.object({
  email: z.string().email("E-mail inválido"),
});
type EmailForm = z.infer<typeof emailSchema>;

// Etapa 2 — OTP + nova senha (min 8, igual ao Better Auth)
const resetSchema = z
  .object({
    otp: z.string().length(6, "Código deve ter 6 dígitos"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
type ResetForm = z.infer<typeof resetSchema>;

export default function ForgotPasswordPage() {
  const { theme } = useTheme();

  const getLogo = () => {
    if (theme === "dark") return logoDark;
    if (theme === "light") return logoLight;
    if (theme === "system") {
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return isSystemDark ? logoDark : logoLight;
    }
    return logoLight;
  };

  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);

  // 🔹 Toggle de visibilidade das senhas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    mode: "onChange", // 🔹 valida enquanto digita → botão desabilita em tempo real
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  // Etapa 1: envia OTP
  async function onSendOtp(values: EmailForm) {
    try {
      setSending(true);
      await api.post("/auth/email-otp/request-password-reset", {
        email: values.email,
      });
      setEmail(values.email);
      setStep("reset");
      toast.success("Código enviado. Verifique seu e-mail.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao enviar código."));
    } finally {
      setSending(false);
    }
  }

  // Etapa 2: valida OTP + troca senha
  async function onReset(values: ResetForm) {
    try {
      setResetting(true);
      await api.post("/auth/email-otp/reset-password", {
        email,
        otp: values.otp,
        password: values.password,
      });
      toast.success("Senha alterada! Faça login com a nova senha.");
      navigate("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Código inválido ou expirado."));
    } finally {
      setResetting(false);
    }
  }

  // 🔹 Desabilita o botão se o form ainda não é válido (senhas não batem, curtas, OTP incompleto…)
  const canSubmitReset = resetForm.formState.isValid && !resetting;

  return (
    <div className="min-h-screen flex items-center flex-col px-4">
      <div className="flex justify-center w-full mt-10 mb-20">
        <Link to="/" className="">
          <img src={getLogo()} className="max-w-[280px] w-full" />
        </Link>
      </div>
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Recuperar senha</h1>
          <p className="text-sm text-muted-foreground">
            {step === "email"
              ? "Informe seu e-mail para receber um código de verificação."
              : `Enviamos um código de 6 dígitos para ${email}.`}
          </p>
        </div>

        {step === "email" ? (
          <form
            onSubmit={emailForm.handleSubmit(onSendOtp)}
            className="space-y-4"
          >
            <Controller
              control={emailForm.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">E-mail</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-9 h-10"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Button
              type="submit"
              className="w-full py-5 cursor-pointer"
              disabled={sending}
            >
              {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar código
            </Button>
          </form>
        ) : (
          <form
            onSubmit={resetForm.handleSubmit(onReset)}
            className="space-y-4"
          >
            <Controller
              control={resetForm.control}
              name="otp"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="otp">Código de verificação</FieldLabel>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}

                  <ResendOtpButton email={email} />
                </Field>
              )}
            />

            {/* Nova senha */}
            <Controller
              control={resetForm.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">Nova senha</FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={
                        showPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Confirmar nova senha */}
            <Controller
              control={resetForm.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar nova senha
                  </FieldLabel>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      {...field}
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-9 pr-10"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={
                        showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={!canSubmitReset}
            >
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Alterar senha
            </Button>

            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Reenviar código para outro e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
