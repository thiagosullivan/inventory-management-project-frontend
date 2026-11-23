import type { SectorRef } from "./sectors.types";

export type UserRole = "MANAGER" | "STAFF";

export interface Sector {
  id: string;
  name: string;
  isWarehouse: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  sectorId: string;
  sector: SectorRef;
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

export interface UpdateProfilePayload {
  name: string;
}

export interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateAvatarPayload {
  url: string;
}

export interface RequestEmailChangePayload {
  newEmail: string;
}

export interface ConfirmEmailChangePayload {
  newEmail: string;
  otp: string;
}

export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}
