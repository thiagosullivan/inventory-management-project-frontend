// src/pages/ReportsHubPage.tsx
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  PackageMinus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReportCardConfig {
  title: string;
  description: string;
  href: string;
  icon: typeof BarChart3;
}

const CARDS: ReportCardConfig[] = [
  {
    title: "Pedidos",
    description:
      "Auditoria de pedidos por status, setor e período. Comparativo pedido × enviado com percentual de atendimento.",
    href: "/relatorios/pedidos",
    icon: ClipboardList,
  },
  {
    title: "Consumo por setor",
    description:
      "Consumo agregado por setor no período. Ranking de produtos, valor consumido e itens prioritários.",
    href: "/relatorios/consumo",
    icon: BarChart3,
  },
  {
    title: "Saídas manuais",
    description:
      "Movimentações de saída sem remessa vinculada. Origem, autor, motivo e valor.",
    href: "/relatorios/saidas-manuais",
    icon: PackageMinus,
  },
];

export default function ReportsHubPage() {
  return (
    <section className="flex flex-col mx-auto gap-6 w-full max-w-6xl px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-primary">Relatórios</h1>
        <p className="text-sm text-muted-foreground">
          Consultas analíticas do Almoxarifado. Escolha um relatório para
          começar.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              to={card.href}
              className="group block focus:outline-none"
            >
              <Card className="h-full transition-shadow group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-primary">
                <CardHeader className="flex flex-row items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </span>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <CardDescription className="min-h-[60px]">
                    {card.description}
                  </CardDescription>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Abrir
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
