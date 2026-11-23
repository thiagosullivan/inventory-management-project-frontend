// src/pages/MinhaContaPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadButton } from "@/lib/uploadthing";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/services/auth";
import {
  useConfirmEmailChange,
  useMyProfile,
  useMySessions,
  useRequestEmailChange,
  useRevokeAllSessions,
  useRevokeSession,
  useUpdateMyAvatar,
  useUpdateMyPassword,
  useUpdateMyProfile,
} from "@/hooks/useMe";
import { Eye, EyeOff } from "lucide-react";

export default function MinhaContaPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const profileQuery = useMyProfile();
  const profile = profileQuery.data ?? user;

  const updateProfile = useUpdateMyProfile();
  const updatePassword = useUpdateMyPassword();
  const updateAvatar = useUpdateMyAvatar();
  const sessionsQuery = useMySessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();
  const requestChange = useRequestEmailChange();
  const confirmChange = useConfirmEmailChange();

  // 🔹 Perfil — draft local. undefined = mostra profile.name; string = usuário digitou.
  const [nameDraft, setNameDraft] = useState<string | undefined>(undefined);
  const displayName = nameDraft ?? profile?.name ?? "";

  // Segurança
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // E-mail
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

  async function handleSaveName() {
    if (displayName.trim().length < 2) {
      toast.error("Nome deve ter pelo menos 2 caracteres.");
      return;
    }
    const updated = await updateProfile.mutateAsync({
      name: displayName.trim(),
    });
    if (user) setUser({ ...user, name: updated.name });
    setNameDraft(undefined); // volta a mostrar o profile.name atualizado
  }

  async function handleSavePassword() {
    if (!currentPassword || !newPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    await updatePassword.mutateAsync({ currentPassword, newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleRequestEmailChange() {
    if (!newEmail.includes("@")) {
      toast.error("Novo e-mail inválido.");
      return;
    }
    await requestChange.mutateAsync({ newEmail });
    setEmailOtpSent(true);
  }

  async function handleConfirmEmailChange() {
    await confirmChange.mutateAsync({ newEmail, otp: emailOtp });
    const result = await getMe();
    if (result.status === "ok") setUser(result.user);
    setShowEmailChange(false);
    setEmailOtpSent(false);
    setNewEmail("");
    setEmailOtp("");
  }

  if (!profile) return null;

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-primary">Minha conta</h1>

      <Tabs defaultValue="perfil">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="verificacao">Verificação</TabsTrigger>
          <TabsTrigger value="sessoes">Sessões</TabsTrigger>
        </TabsList>

        {/* ============================ PERFIL ============================ */}
        <TabsContent value="perfil" className="space-y-6 pt-4">
          <div className="space-y-1">
            <Label>Nome</Label>
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={(e) => setNameDraft(e.target.value)}
              />
              <Button
                onClick={handleSaveName}
                disabled={updateProfile.isPending || nameDraft === undefined}
                className="cursor-pointer"
              >
                Salvar
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Foto</Label>
            <div className="flex items-center gap-4">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover border"
                />
              ) : (
                <div className="h-16 w-16 rounded-full border border-dashed flex items-center justify-center text-xs text-muted-foreground">
                  Sem foto
                </div>
              )}
              <UploadButton
                endpoint="userAvatar"
                onBeforeUploadBegin={async (files) => {
                  const compressed = await Promise.all(
                    files.map((f) =>
                      imageCompression(f, {
                        maxWidthOrHeight: 200,
                        maxSizeMB: 0.2,
                        useWebWorker: true,
                        fileType: "image/webp",
                      }),
                    ),
                  );
                  return compressed;
                }}
                onClientUploadComplete={async (res) => {
                  const url = res?.[0]?.ufsUrl;
                  if (!url) return;
                  const updated = await updateAvatar.mutateAsync({ url });
                  if (user) setUser({ ...user, image: updated.image });
                }}
                onUploadError={(error) => {
                  console.error("Erro no upload:", error);
                  toast.error("Falha ao enviar avatar.");
                }}
                appearance={{
                  button:
                    "bg-primary text-primary-foreground hover:bg-primary/90 text-sm px-4 py-2 rounded-md ut-uploading:cursor-not-allowed",
                  allowedContent: "hidden",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return "Enviando...";
                    if (!ready) return "Preparando...";
                    return profile.image ? "Trocar foto" : "Escolher foto";
                  },
                }}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>E-mail</Label>
            <div className="flex gap-2">
              <Input value={profile.email} readOnly />
              <Button
                variant="outline"
                onClick={() => setShowEmailChange((v) => !v)}
                className="cursor-pointer"
              >
                {showEmailChange ? "Cancelar" : "Alterar"}
              </Button>
            </div>

            {showEmailChange && (
              <div className="mt-3 space-y-3 rounded border p-3">
                {!emailOtpSent ? (
                  <>
                    <Label>Novo e-mail</Label>
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="novo@email.com"
                      autoComplete="off"
                    />
                    <Button
                      size="sm"
                      onClick={handleRequestEmailChange}
                      disabled={requestChange.isPending}
                      className="cursor-pointer"
                    >
                      {requestChange.isPending
                        ? "Enviando..."
                        : "Enviar código"}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Código enviado para <strong>{newEmail}</strong>.
                    </p>
                    <Label>Código recebido</Label>
                    <Input
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                      inputMode="numeric"
                      autoComplete="off"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleConfirmEmailChange}
                        disabled={
                          confirmChange.isPending || emailOtp.length !== 6
                        }
                        className="cursor-pointer"
                      >
                        {confirmChange.isPending
                          ? "Confirmando..."
                          : "Confirmar troca"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEmailOtpSent(false);
                          setEmailOtp("");
                        }}
                        className="cursor-pointer"
                      >
                        Reenviar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ========================= SEGURANÇA ========================= */}
        <TabsContent value="seguranca" className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label>Senha atual</Label>
            <div className="relative">
              <Input
                type={showPassword1 ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword1(!showPassword1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword1 ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Nova senha</Label>
            <div className="relative">
              <Input
                type={showPassword2 ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword2 ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Confirmar nova senha</Label>
            <div className="relative">
              <Input
                type={showPassword3 ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword3(!showPassword3)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                aria-label={showPassword3 ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword3 ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <Button
            onClick={handleSavePassword}
            disabled={updatePassword.isPending}
            className="cursor-pointer"
          >
            {updatePassword.isPending ? "Alterando..." : "Alterar senha"}
          </Button>
        </TabsContent>

        {/* ======================== VERIFICAÇÃO ======================== */}
        <TabsContent value="verificacao" className="space-y-4 pt-4">
          <p className="text-sm">
            Status:{" "}
            <strong
              className={
                profile.emailVerified ? "text-emerald-600" : "text-amber-600"
              }
            >
              {profile.emailVerified ? "Verificado" : "Não verificado"}
            </strong>
          </p>
          {!profile.emailVerified && (
            <Button
              onClick={() => navigate("/verify-email")}
              className="cursor-pointer"
            >
              Verificar agora
            </Button>
          )}
        </TabsContent>

        {/* ========================= SESSÕES ========================= */}
        <TabsContent value="sessoes" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Dispositivos conectados
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => revokeAll.mutate()}
              disabled={revokeAll.isPending}
              className="cursor-pointer"
            >
              {revokeAll.isPending ? "Revogando..." : "Revogar todas"}
            </Button>
          </div>

          {sessionsQuery.isLoading && (
            <p className="text-sm text-muted-foreground">
              Carregando sessões...
            </p>
          )}

          {!sessionsQuery.isLoading &&
            (sessionsQuery.data?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma sessão encontrada.
              </p>
            )}

          <ul className="divide-y rounded border">
            {sessionsQuery.data?.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {s.isCurrent
                      ? "Esta sessão"
                      : (s.userAgent ?? "Dispositivo desconhecido")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {s.ipAddress ?? "IP desconhecido"} ·{" "}
                    {new Date(s.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
                {!s.isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => revokeSession.mutate(s.id)}
                    disabled={revokeSession.isPending}
                    className="cursor-pointer"
                  >
                    Revogar
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </section>
  );
}
