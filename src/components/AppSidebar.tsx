import { NavLink, useLocation } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { Gauge, Eye, Zap, Wrench, BarChart3, Settings, Blocks, Radar } from "lucide-react";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Gauge },
  { title: "AI Visibility", url: "/ai-visibility-dashboard", icon: Eye },
  { title: "Zero‑Click", url: "/zero-click-dashboard", icon: Zap },
  { title: "SEO & TSO", url: "/seo-tso-dashboard", icon: Radar },
  { title: "Competitive", url: "/competitive-dashboard", icon: Blocks },
  { title: "Content", url: "/content-dashboard", icon: Wrench },
  { title: "Analytics", url: "/analytics-dashboard", icon: BarChart3 },
  { title: "Tools", url: "/tools-dashboard", icon: Wrench },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isExpanded = items.some((i) => isActive(i.url));
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible>
      <SidebarContent>
        <SidebarGroup open={isExpanded}>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
