import type { DashboardOverviewData } from "@/types/dashboard.types";
import { Boxes, MoveUpRight, Package } from "lucide-react";

interface Last30DaysProps {
  summary: DashboardOverviewData["summary"];
}

export default function Last30Days({ summary }: Last30DaysProps) {
  return (
    <div className="border rounded-lg shadow-lg w-full p-5">
      <h3 className="text-center mb-10 text-xl">
        {summary.movementsPeriod === "last_30_days" ? "Últimos 30 Dias" : ""}
      </h3>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-x-2">
        <div className="text-center flex flex-col items-center gap-y-1 sm:gap-y-2">
          <Package color="#0080FC" />
          <h4 className="uppercase text-xs sm:text-base font-bold mb-1 sm:mb-4">
            Total de Produtos
          </h4>
          <div className="text-lg sm:text-3xl text-primary">
            {summary.totalProducts}
          </div>
        </div>

        <div className="block my-4 sm:my-0 w-[250px] sm:w-px bg-muted-foreground h-px sm:h-24" />

        <div className="text-center flex flex-col items-center gap-y-1 sm:gap-y-2">
          <Boxes color="#FE005F" />
          <h4 className="uppercase text-xs sm:text-base font-bold mb-1 sm:mb-4">
            Total de Unidades
          </h4>
          <div className="text-lg sm:text-3xl text-primary">
            {summary.totalUnits}
          </div>
        </div>

        <div className="block my-4 sm:my-0 w-[250px] sm:w-px bg-muted-foreground h-px sm:h-24" />

        <div className="text-center flex flex-col items-center gap-y-1 sm:gap-y-2">
          <MoveUpRight color="#FEB000" />
          <h4 className="uppercase text-xs sm:text-base font-bold mb-1 sm:mb-4">
            Total de Movimentações
          </h4>
          <div className="text-lg sm:text-3xl text-logo-third">
            {summary.totalMovements}
          </div>
        </div>
      </div>
    </div>
  );
}
