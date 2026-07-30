import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/store/auth";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";
import WorkforcePage from "@/pages/WorkforcePage";
import TasksPage from "@/pages/TasksPage";
import TaskDetailPage from "@/pages/TaskDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import CalendarPage from "@/pages/CalendarPage";
import ApprovalsPage from "@/pages/ApprovalsPage";
import ScheduledPage from "@/pages/ScheduledPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AccountsPage from "@/pages/AccountsPage";
import KnowledgePage from "@/pages/KnowledgePage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import BillingPage from "@/pages/BillingPage";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/workforce" element={<WorkforcePage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/scheduled" element={<ScheduledPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/knowledge" element={<KnowledgePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/billing" element={<BillingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
