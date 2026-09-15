import type { DashboardOverviewResponse } from "@/types/dashboard.types";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { MovementLineChart } from "@/components/charts/LineChart";
import Last30Days from "@/components/Last30Days";
import { CategoryDonutChart } from "@/components/charts/DonutsChart";

const fetchDashboardOverview = async (): Promise<DashboardOverviewResponse> => {
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
    <div className="flex items-start justify-center mx-auto ">
      {/* <h1>Dashboard</h1> */}

      <div className="flex flex-col max-w-[1050px] w-full gap-y-8">
        <Last30Days summary={summary} />

        <div className="flex items-center gap-4">
          <MovementLineChart data={trends.dailyMovements} />
          <CategoryDonutChart data={topItems.categoryDistribution} />
        </div>
      </div>
    </div>
  );
}
