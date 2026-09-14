// src/services/api.ts
import axios from "axios";
import { getSession } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const data = await getSession();

      if (data && data.session && data.session.token) {
        const token = data.session.token;

        config.headers.set("Authorization", `Bearer ${token}`);

        config.withCredentials = true;
      }
    } catch (error) {
      console.error("Erro ao obter a sessão para o header:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);
