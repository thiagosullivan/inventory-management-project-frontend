import type { DashboardOverviewResponse } from "@/types/dashboard.types";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Package, MoveUpRight, Boxes } from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

const fetchDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
  // 🚀 O token agora é injetado automaticamente via interceptor!
  const response = await api.get<DashboardOverviewResponse>(
    "/admin/dashboard/overview",
  );
  return response.data;
};

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: fetchDashboardOverview,
    staleTime: 1000 * 60 * 5,
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state?.accessDenied) {
      toast.error("Acesso Negado", {
        description: "Você não tem permissão para acessar aquela métrica.",
      });
    }
  }, [location]);

  if (isLoading) return <div>Carregando indicadores do dashboard...</div>;
  if (isError || !data?.success)
    return <div>Erro ao carregar dados do painel.</div>;

  const { summary, topItems, trends } = data.data;
  console.log(summary, "summary");
  console.log(topItems, "Top items");
  console.log(trends, "trends ");

  return (
    <div className="flex items-start justify-center mx-auto max-w-[1050px] w-full">
      {/* <h1>Dashboard</h1> */}

      <div className="border rounded-lg shadow-lg w-full p-5">
        <h3 className="text-center mb-10 text-xl">
          {summary.movementsPeriod === "last_30_days" ? "Last 30 Days" : ""}
        </h3>
        <div className="flex items-center justify-around">
          <div className="text-center flex flex-col items-center gap-y-2">
            <Package color="#0080FC" />
            <h4 className="uppercase text-base font-bold mb-4">
              Total Products
            </h4>
            <div className="text-3xl text-primary">{summary.totalProducts}</div>
          </div>

          <div className="block w-px bg-muted-foreground h-24" />

          <div className="text-center flex flex-col items-center gap-y-2">
            <Boxes color="#FE005F" />
            <h4 className="uppercase text-base font-bold mb-4">Total Units</h4>
            <div className="text-3xl text-logo-second">
              {summary.totalUnits}
            </div>
          </div>

          <div className="block w-px bg-muted-foreground h-24" />

          <div className="text-center flex flex-col items-center gap-y-2">
            <MoveUpRight color="#FEB000" />
            <h4 className="uppercase text-base font-bold mb-4">
              Total Movements
            </h4>
            <div className="text-3xl text-logo-third">
              {summary.totalMovements}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
