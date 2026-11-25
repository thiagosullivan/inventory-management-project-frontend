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

  const { summary, topItems, trends } = data;

  return (
    <section className="w-full max-w-295 mx-auto">
      <div className="flex flex-col w-full gap-y-6">
        <Last30Days summary={summary} />

        {/* Gráficos: 1 coluna até 1024px, 2 colunas iguais acima disso */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full items-stretch">
          <div className="min-w-0 lg:col-span-8">
            <MovementLineChart data={trends.dailyMovements} />
          </div>
          <div className="min-w-0 lg:col-span-4">
            <CategoryDonutChart data={topItems.categoryDistribution} />
          </div>
        </div>

        {/* Tabelas: 1 coluna até 1280px, 2 colunas iguais (50% cada) acima disso */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
          <HighestQuantityProducts data={topItems.highestQuantityProducts} />
          <LowestQuantityProducts data={topItems.lowestQuantityProducts} />
        </div>
      </div>
    </section>
  );
}
