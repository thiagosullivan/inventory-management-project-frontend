import * as React from "react";

// import { SearchForm } from "@/components/search-form";
// import { VersionSwitcher } from "@/components/version-switcher";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  LayoutDashboard,
  ShoppingCart,
  Layers,
  ClipboardList,
  ArrowLeftRight,
  ListClock,
  ListSortDescending,
  BarChart3,
  Bell,
  UserRoundCog,
  ShieldCogCorner,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import { TeamSwitcher } from "./TeamSwitcher";
import { NavUser } from "./NavUser";
import { ModeToggle } from "../modeToggle";

// This is sample data.
const data = {
  navLinks: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Produtos",
      icon: ShoppingCart,
      href: "/produtos",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Estoque",
      icon: Layers,
      href: "/estoque",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Pedidos",
      icon: ClipboardList,
      href: "/pedidos",
      isActive: true,
    },
    {
      label: "Movimentações",
      icon: ArrowLeftRight,
      href: "/movimentacoes",
      isActive: true,
    },
    {
      label: "Histórico",
      icon: ListClock,
      href: "/historico",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Categorias",
      icon: ListSortDescending,
      href: "/categorias",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      warehouseOnly: true,
      isActive: true,
    },
    {
      label: "Alertas",
      icon: Bell,
      href: "/alertas",
      isActive: true,
    },
    {
      label: "Minha Conta",
      icon: UserRoundCog,
      href: "/minha-conta",
      isActive: true,
    },
    {
      label: "Admin",
      icon: ShieldCogCorner,
      href: "/admin",
      onlyManager: true,
      isActive: true,
    },
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function SidebarMobile({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <div className="lg:hidden">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={data.navLinks} />
          {/* <NavProjects projects={data.projects} /> */}
        </SidebarContent>
        <SidebarFooter>
          {/* <NavUser user={data.user} /> */}
          {/* <ModeToggle /> */}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
