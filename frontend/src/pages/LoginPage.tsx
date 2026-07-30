import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Sparkles } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "@/store/auth";
import { Spinner } from "@/components/ui";

const HIGHLIGHTS = [
  "A Master Orchestrator that turns goals into finished campaigns",
  "20 specialized AI employees collaborating autonomously",
  "Live task timeline, approvals, scheduling and analytics",
];

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("founder@acme.ai");
  const [password, setPassword] = useState("password");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token =
        mode === "login"
          ? await authApi.login(email, password)
          : await authApi.register(email, name, password);
      setAuth(token.access_token, token.user);
      navigate(token.user.workspace_id ? "/" : "/onboarding");
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Something went wrong";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-12 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Bot className="h-6 w-6" />
          </div>
          <span className="text-lg font-bold">AI Workforce</span>
        </div>
        <div>
          <h1 className="max-w-md text-4xl font-extrabold leading-tight">
            Hire a team of AI employees for your social media.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            Not a chatbot — an autonomous workforce that researches, writes, approves,
            schedules and learns. You give the goal; they do the work.
          </p>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-sm text-brand-50">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-brand-200">
          © {new Date().getFullYear()} AI Workforce. All systems autonomous.
        </p>
      </div>

      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <form onSubmit={submit} className="w-full max-w-sm">
          <h2 className="text-2xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {mode === "login"
              ? "Sign in to your AI workforce."
              : "Start building your autonomous workforce."}
          </p>

          {mode === "register" && (
            <div className="mt-6">
              <label className="label">Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ava Founder"
                required
              />
            </div>
          )}
          <div className="mt-4">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4 text-white" /> : null}
            {mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-brand-600 hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>

          {mode === "login" && (
            <p className="mt-6 rounded-lg bg-slate-50 px-3 py-2 text-center text-xs text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              Demo — <b>founder@acme.ai</b> / <b>password</b>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
