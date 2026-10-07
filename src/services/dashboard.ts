import { api } from "./api";
import type { DashboardOverviewData } from "@/types/dashboard.types";

/**
 * Envelope da API. O axios devolve { success, data }, não o payload direto.
 * O service desembrulha e retorna só o payload.
 */
interface GetDashboardOverviewApiResponse {
  success: boolean;
  data: DashboardOverviewData;
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  const response = await api.get<GetDashboardOverviewApiResponse>(
    "/admin/dashboard/overview",
  );
  return response.data.data; // 👈 desembrulha AQUI, retorna o payload
}
