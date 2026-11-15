// src/components/reports/ReportsNav.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ReportTabValue = "requests" | "consumption" | "manual-output";

const TAB_ROUTES: Record<ReportTabValue, string> = {
  requests: "/reports/requests",
  consumption: "/reports/consumption",
  "manual-output": "/reports/manual-output",
};

function getActiveTab(pathname: string): ReportTabValue | undefined {
  if (pathname.startsWith("/reports/requests")) return "requests";
  if (pathname.startsWith("/reports/consumption")) return "consumption";
  if (pathname.startsWith("/reports/manual-output")) return "manual-output";
  return undefined;
}

/**
 * 🔹 Tabs de link cruzado entre R1/R2/R2b.
 *    Não renderiza nada no hub `/reports` (não há aba ativa).
 */
export function ReportsNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const active = getActiveTab(location.pathname);

  if (!active) return null;

  return (
    <Tabs
      value={active}
      onValueChange={(value) => {
        const key = value as ReportTabValue;
        const route = TAB_ROUTES[key];
        if (route) navigate(route);
      }}
    >
      <TabsList>
        <TabsTrigger value="requests" className="cursor-pointer">
          Pedidos
        </TabsTrigger>
        <TabsTrigger value="consumption" className="cursor-pointer">
          Consumo
        </TabsTrigger>
        <TabsTrigger value="manual-output" className="cursor-pointer">
          Saídas manuais
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
