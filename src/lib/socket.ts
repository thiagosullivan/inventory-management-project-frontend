// src/lib/socket.ts
import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:3000";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
