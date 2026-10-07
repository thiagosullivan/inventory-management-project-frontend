import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { MovementLineChart } from "@/components/charts/LineChart";
import Last30Days from "@/components/home/Last30Days";
import { CategoryDonutChart } from "@/components/charts/DonutsChart";
import { HighestQuantityProducts } from "@/components/home/HighestQuantityProducts";
import LowestQuantityProducts from "@/components/home/LowestQuantityProducts";

import { fetchDashboardOverview } from "@/services/dashboard";

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardOverview"],
    queryFn: fetchDashboardOverview,
    staleTime: 1000 * 60 * 5,
  });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.accessDenied) {
      toast.error("Acesso Negado", {
        id: "access-denied-toast",
        description: "Você não tem permissão para acessar aquela métrica.",
      });

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  if (isLoading) return <div>Carregando indicadores do dashboard...</div>;
  if (isError || !data) return <div>Erro ao carregar dados do painel.</div>;

  // 🔹 agora `data` é o DashboardOverviewResponse direto (sem `.data` duplo)
  const { summary, topItems, trends } = data;

  return (
    <section className="flex items-start justify-center mx-auto">
      <div className="flex flex-col max-w-[1180px] w-full gap-y-8">
        <Last30Days summary={summary} />

        <div className="flex items-center gap-4">
          <MovementLineChart data={trends.dailyMovements} />
          <CategoryDonutChart data={topItems.categoryDistribution} />
        </div>
        <div className="flex justify-between items-center gap-4">
          <HighestQuantityProducts data={topItems.highestQuantityProducts} />
          <LowestQuantityProducts data={topItems.lowestQuantityProducts} />
        </div>
      </div>
    </section>
  );
}
