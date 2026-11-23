// src/services/email-otp.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

interface OtpResponse {
  success?: boolean;
  message?: string;
}

async function postAuth(path: string, body: unknown): Promise<OtpResponse> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 🔹 Better Auth exige Origin para POSTs em dev (MISSING_OR_NULL_ORIGIN)
      Origin: window.location.origin,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => ({}))) as OtpResponse;

  if (!response.ok) {
    throw new Error(data.message || "Erro ao processar código");
  }

  return data;
}

/** Envia OTP de verificação de e-mail (type: "email-verification") */
export async function sendEmailVerificationOtp(email: string): Promise<void> {
  await postAuth("/auth/email-otp/send-verification-otp", {
    email,
    type: "email-verification",
  });
}

/** Verifica o e-mail com o OTP recebido */
export async function verifyEmailOtp(
  email: string,
  otp: string,
): Promise<void> {
  await postAuth("/auth/email-otp/verify-email", { email, otp });
}
