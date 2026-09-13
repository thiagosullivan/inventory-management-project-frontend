import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import logo from "../../../public/logo.png";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { signIn } from "../../services/auth";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  email: z
    .string()
    .email("Insira um e-mail válido.") // Melhorado o validador para e-mail real
    .min(5, "E-mail deve ter pelo menos 5 caracteres."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."), // Ajustado min de 20 para 6 (comum para senhas)
  rememberMe: z.boolean(),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const { setUser } = useAuth();

  async function onSubmit(data: z.infer<typeof formSchema>): Promise<void> {
    setIsSubmitting(true);

    try {
      const session = await signIn({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      setUser(session.user);
      toast.success("Login realizado!");
      navigate("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao fazer login";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <div className="min-w-[445px] w-full">
        <div className="mb-8">
          <img src={logo} className="mb-10" />
          <h2 className="font-bold text-3xl mb-1">Welcome 👋</h2>
          <p className="font-light text-muted-foreground">Please login here</p>
        </div>
      </div>
      <div>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-y-5 mb-4">
            <FieldGroup className="mb-0">
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="relative h-[55px]"
                  >
                    <FieldLabel
                      htmlFor="form-rhf-demo-email"
                      className="absolute text-primary text-xs font-light px-4 pt-1"
                    >
                      Email Address
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-rhf-demo-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="example@email.com"
                      autoComplete="off"
                      className="px-4 pt-6 pb-1.5 h-[55px] border-primary font-medium"
                      type="email"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup>
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="relative h-[55px]"
                  >
                    <FieldLabel
                      htmlFor="form-rhf-demo-password"
                      className="absolute text-primary text-xs font-light px-4 pt-1"
                    >
                      Password
                    </FieldLabel>
                    <div>
                      <Input
                        {...field}
                        id="form-rhf-demo-password"
                        aria-invalid={fieldState.invalid}
                        placeholder="Your password"
                        className="px-4 pt-6 pb-1.5 h-[55px] border-primary font-medium"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        aria-label={
                          showPassword ? "Esconder senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={24} />
                        ) : (
                          <Eye size={24} />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </div>
          <div className="flex items-center justify-between mb-8">
            <FieldGroup>
              <Controller
                name="rememberMe"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id="rememberMe"
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldLabel
                      htmlFor="rememberMe"
                      className="text-base font-ligth cursor-pointer"
                    >
                      Remember me
                    </FieldLabel>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <div>
              <Link
                to="/forgot-password"
                className="whitespace-nowrap text-primary font-light"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-[55px] cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
