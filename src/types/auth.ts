export interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string | Date;
  token: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthSessionResponse {
  user: User;
  session: Session;
}

export interface SignInPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthErrorResponse {
  message?: string;
  code?: string;
}
