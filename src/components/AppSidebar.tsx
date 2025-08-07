import { NavLink } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, LayoutDashboard, FileText, BarChart3, Settings as SettingsIcon, Globe, ListChecks, ChartBarBig, Spline, AudioLines, Landmark, ChartNoAxesGantt, FileSearch, Shield, Grid2x2 } from "lucide-react";
import { cn } from "@/lib/utils";
const mainNav = [{
  title: "Home",
  url: "/",
  icon: Home
}, {
  title: "About",
  url: "/about",
  icon: FileText
}, {
  title: "Resources",
  url: "/resources",
  icon: FileSearch
}, {
  title: "Upgrade",
  url: "/upgrade",
  icon: Landmark
}, {
  title: "Settings",
  url: "/settings",
  icon: SettingsIcon
}];
const dashboardNav = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}, {
  title: "Generator",
  url: "/generator",
  icon: Grid2x2
}, {
  title: "History",
  url: "/history",
  icon: ListChecks
}, {
  title: "Content Analysis",
  url: "/content-analysis",
  icon: FileText
}, {
  title: "SEO Analysis Hub",
  url: "/seo-analysis",
  icon: BarChart3
}, {
  title: "Domain Analysis",
  url: "/domain-analysis",
  icon: Globe
}, {
  title: "Schema Analysis",
  url: "/schema-analysis",
  icon: Shield
}, {
  title: "Citation Checker",
  url: "/citation-checker",
  icon: ChartBarBig
}, {
  title: "AI Sitemap",
  url: "/ai-sitemap",
  icon: Spline
}];
const tsoNav = [{
  title: "TSO Dashboard",
  url: "/tso-dashboard",
  icon: LayoutDashboard
}, {
  title: "TSO Onboarding",
  url: "/tso-onboarding",
  icon: Landmark
}, {
  title: "AI Visibility Tracker",
  url: "/ai-visibility-tracker",
  icon: ChartNoAxesGantt
}, {
  title: "Zero Click Optimizer",
  url: "/zero-click-optimizer",
  icon: ChartBarBig
}, {
  title: "Technical AI Readiness",
  url: "/technical-ai-readiness",
  icon: Shield
}, {
  title: "Intent Driven Research",
  url: "/intent-driven-research",
  icon: FileSearch
}, {
  title: "Semantic Analyzer",
  url: "/semantic-analyzer",
  icon: FileText
}, {
  title: "Voice Search Optimizer",
  url: "/voice-search-optimizer",
  icon: AudioLines
}, {
  title: "Authority Tracker",
  url: "/authority-tracker",
  icon: Landmark
}, {
  title: "Competitive AI Analysis",
  url: "/competitive-ai-analysis",
  icon: ChartBarBig
}, {
  title: "Business Type Templates",
  url: "/business-type-templates",
  icon: Grid2x2
}];
function NavSection({
  label,
  items
}: {
  label: string;
  items: {
    title: string;
    url: string;
    icon: any;
  }[];
}) {
  return <SidebarGroup>
      <SidebarGroupLabel className="text-xs tracking-wide uppercase text-muted-foreground/70">{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(item => <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink to={item.url} end className={({
              isActive
            }) => cn("flex items-center gap-2", isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50")}>
                  <item.icon className="h-4 w-4" />
                  <span className="link-gradient font-bold">{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>;
}
export default function AppSidebar() {
  return <Sidebar className="border-r">
      <SidebarHeader className="p-3">
        <NavLink to="/" className="flex items-center gap-2">
          <img src="/lovable-uploads/21ed5c0e-6a0c-427c-96e5-419307020d09.png" alt="GenerativeSearch.pro logo" loading="eager" className="h-40 w-auto" />
        </NavLink>
      </SidebarHeader>
      <SidebarContent>
        <NavSection label="Main" items={mainNav} />
        <NavSection label="Dashboard" items={dashboardNav} />
        <NavSection label="TSO" items={tsoNav} />
      </SidebarContent>
    </Sidebar>;
}