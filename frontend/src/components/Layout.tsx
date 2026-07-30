import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  CheckSquare,
  CreditCard,
  LayoutDashboard,
  Link2,
  ListTodo,
  LogOut,
  Menu,
  Moon,
  Send,
  Settings,
  Sun,
  Wifi,
  WifiOff,
} from "lucide-react";
import { analyticsApi } from "@/lib/api";
import { useTaskSocket } from "@/lib/useTaskSocket";
import { useAuth } from "@/store/auth";
import { useTheme } from "@/store/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/workforce", label: "AI Workforce", icon: Bot },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/projects", label: "Projects", icon: CheckSquare },
  { to: "/calendar", label: "Content Calendar", icon: CalendarDays },
  { to: "/approvals", label: "Approvals", icon: BadgeCheck },
  { to: "/scheduled", label: "Scheduled Posts", icon: Send },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/accounts", label: "Connected Accounts", icon: Link2 },
  { to: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { data: summary } = useQuery({
    queryKey: ["dashboard"],
    queryFn: analyticsApi.dashboard,
  });
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">AI Workforce</p>
          <p className="text-xs text-slate-400">Autonomous social</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const badge =
            item.to === "/approvals"
              ? summary?.pending_approvals
              : item.to === "/notifications"
                ? summary?.unread_notifications
                : undefined;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {badge ? (
                <span className="badge bg-brand-600 text-white">{badge}</span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const connected = useTaskSocket();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const doLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block dark:border-slate-800 dark:bg-slate-900">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            className="btn-ghost lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-xs font-medium lg:flex">
            {connected ? (
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <Wifi className="h-3.5 w-3.5" /> Live
              </span>
            ) : (
              <span className="badge bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <WifiOff className="h-3.5 w-3.5" /> Offline
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost" onClick={toggle} aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 py-1 pl-1 pr-3 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.role}</p>
              </div>
            </div>
            <button className="btn-ghost" onClick={doLogout} aria-label="Log out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
