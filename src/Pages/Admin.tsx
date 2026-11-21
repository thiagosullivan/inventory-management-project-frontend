import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface HubCardProps {
  title: string;
  description: string;
  href?: string;
  icon: React.ReactNode;
  soon?: boolean;
}

function HubCard({ title, description, href, icon, soon }: HubCardProps) {
  const inner = (
    <Card
      className={`h-full transition ${
        soon
          ? "opacity-60 cursor-not-allowed"
          : "cursor-pointer hover:border-primary hover:shadow-md"
      }`}
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <div className="p-2 rounded-md bg-primary/10 text-primary">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
        {soon && (
          <span className="ml-auto text-xs text-muted-foreground">
            Em breve
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (href && !soon) return <Link to={href}>{inner}</Link>;
  return inner;
}

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Administração</h1>
        <p className="text-sm text-muted-foreground">
          Área restrita a gerentes.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <HubCard
          title="Usuários"
          description="Criar, editar, inativar e excluir usuários do sistema."
          href="/admin/users"
          icon={<Users className="h-5 w-5" />}
        />
        <HubCard
          title="Setores"
          description="Gestão de setores e Almoxarifado."
          href="/admin/sectors"
          icon={<Building2 className="h-5 w-5" />}
        />
        <HubCard
          title="Configurações"
          description="Parâmetros gerais do sistema."
          icon={<Settings className="h-5 w-5" />}
          soon
        />
      </div>
    </div>
  );
}