import axios from "axios";
import { useAuth } from "@/store/auth";
import type {
  Agent,
  AnalyticsOverview,
  Approval,
  ConnectedAccount,
  ContentItem,
  DashboardSummary,
  KnowledgeDoc,
  Notification,
  ScheduledPost,
  Task,
  TaskSummary,
  Token,
  Workspace,
} from "@/lib/types";

export const api = axios.create({ baseURL: "/api/v1" });

api.interceptors.request.use((config) => {
  const token = useAuth.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && useAuth.getState().token) {
      useAuth.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<Token>("/auth/login", { email, password }).then((r) => r.data),
  register: (email: string, name: string, password: string) =>
    api.post<Token>("/auth/register", { email, name, password }).then((r) => r.data),
};

export const workspaceApi = {
  get: () => api.get<Workspace>("/workspace").then((r) => r.data),
  update: (payload: Partial<Pick<Workspace, "name" | "profile">>) =>
    api.patch<Workspace>("/workspace", payload).then((r) => r.data),
  completeOnboarding: () =>
    api.post<Workspace>("/workspace/onboarding/complete").then((r) => r.data),
};

export const agentApi = {
  list: () => api.get<Agent[]>("/agents").then((r) => r.data),
  get: (key: string) => api.get<Agent>(`/agents/${key}`).then((r) => r.data),
};

export const taskApi = {
  list: () => api.get<TaskSummary[]>("/tasks").then((r) => r.data),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (payload: { title: string; goal: string; platforms: string[] }) =>
    api.post<Task>("/tasks", payload).then((r) => r.data),
};

export const contentApi = {
  list: () => api.get<ContentItem[]>("/content").then((r) => r.data),
  approvals: () => api.get<Approval[]>("/approvals").then((r) => r.data),
  decide: (id: string, approve: boolean, comment?: string) =>
    api
      .post<Approval>(`/approvals/${id}/decision`, { approve, comment })
      .then((r) => r.data),
  scheduled: () => api.get<ScheduledPost[]>("/scheduled").then((r) => r.data),
  accounts: () => api.get<ConnectedAccount[]>("/accounts").then((r) => r.data),
  toggleAccount: (id: string) =>
    api.post<ConnectedAccount>(`/accounts/${id}/toggle`).then((r) => r.data),
  knowledge: () => api.get<KnowledgeDoc[]>("/knowledge").then((r) => r.data),
};

export const analyticsApi = {
  dashboard: () => api.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),
  overview: (days = 30) =>
    api.get<AnalyticsOverview>("/analytics", { params: { days } }).then((r) => r.data),
};

export const notificationApi = {
  list: () => api.get<Notification[]>("/notifications").then((r) => r.data),
  markRead: (id: string) =>
    api.post<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.post("/notifications/read-all").then((r) => r.data),
};
