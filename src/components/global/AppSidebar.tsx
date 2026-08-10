import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  LayoutDashboard,
  Grid2x2,
  Info,
  BookOpen,
  Sparkles,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { SIDEBAR_TOOLS } from "@/config/tools";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const workspaceNav: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "All Tools", url: "/tools", icon: Grid2x2 },
];

const toolsNav: NavItem[] = SIDEBAR_TOOLS.map((tool) => ({
  title: tool.title,
  url: tool.path,
  icon: tool.icon,
}));

const accountNav: NavItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Resources", url: "/resources", icon: BookOpen },
  { title: "About", url: "/about", icon: Info },
  { title: "Upgrade", url: "/upgrade", icon: Sparkles },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs uppercase tracking-wide text-sidebar-foreground/60">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <NavLink
                  to={item.url}
                  end
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "hover:bg-sidebar-accent/50"
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-3">
        <NavLink to="/" className="flex items-center gap-2">
          <img
            src="/lovable-uploads/21ed5c0e-6a0c-427c-96e5-419307020d09.png"
            alt="GenerativeSearch.pro logo"
            loading="eager"
            className="h-12 w-auto"
          />
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Workspace" items={workspaceNav} />
        <NavSection label="Tools" items={toolsNav} />
        <NavSection label="Account" items={accountNav} />
      </SidebarContent>
    </Sidebar>
  );
}
