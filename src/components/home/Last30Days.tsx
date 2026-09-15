import type { DashboardOverviewData } from "@/types/dashboard.types";
import { Boxes, MoveUpRight, Package } from "lucide-react";

interface Last30DaysProps {
  summary: DashboardOverviewData["summary"];
}

export default function Last30Days({ summary }: Last30DaysProps) {
  return (
    <div className="border rounded-lg shadow-lg w-full p-5">
      <h3 className="text-center mb-10 text-xl">
        {summary.movementsPeriod === "last_30_days" ? "Last 30 Days" : ""}
      </h3>
      <div className="flex items-center justify-around">
        <div className="text-center flex flex-col items-center gap-y-2">
          <Package color="#0080FC" />
          <h4 className="uppercase text-base font-bold mb-4">Total Products</h4>
          <div className="text-3xl text-primary">{summary.totalProducts}</div>
        </div>

        <div className="block w-px bg-muted-foreground h-24" />

        <div className="text-center flex flex-col items-center gap-y-2">
          <Boxes color="#FE005F" />
          <h4 className="uppercase text-base font-bold mb-4">Total Units</h4>
          <div className="text-3xl text-logo-second">{summary.totalUnits}</div>
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
  );
}
