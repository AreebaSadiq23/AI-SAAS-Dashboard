import { Check, Sparkles } from "lucide-react";
import { Card, SectionTitle } from "@/components/ui";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    tagline: "Explore your AI workforce",
    features: ["3 AI employees", "1 workspace", "30 posts / mo", "Basic analytics"],
    current: false,
  },
  {
    name: "Growth",
    price: "$79",
    tagline: "For growing teams",
    features: [
      "All 20 AI employees",
      "3 workspaces",
      "Unlimited posts",
      "Advanced analytics",
      "Approvals & scheduling",
    ],
    current: true,
  },
  {
    name: "Scale",
    price: "$249",
    tagline: "Enterprise-ready",
    features: [
      "Everything in Growth",
      "Unlimited workspaces",
      "Custom agents",
      "SSO & audit logs",
      "Priority support",
    ],
    current: false,
  },
];

const INVOICES = [
  { id: "INV-1042", date: "Jul 1, 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-1021", date: "Jun 1, 2026", amount: "$79.00", status: "Paid" },
  { id: "INV-1004", date: "May 1, 2026", amount: "$79.00", status: "Paid" },
];

export default function BillingPage() {
  return (
    <>
      <SectionTitle title="Billing" subtitle="Manage your plan and invoices." />

      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.current
                ? "relative border-2 border-brand-500"
                : "relative"
            }
          >
            {plan.current && (
              <span className="badge absolute right-4 top-4 bg-brand-600 text-white">
                Current
              </span>
            )}
            <p className="font-semibold">{plan.name}</p>
            <p className="text-xs text-slate-400">{plan.tagline}</p>
            <p className="mt-3 text-3xl font-bold">
              {plan.price}
              <span className="text-sm font-normal text-slate-400">/mo</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" /> {f}
                </li>
              ))}
            </ul>
            <button
              className={plan.current ? "btn-outline mt-5 w-full" : "btn-primary mt-5 w-full"}
              disabled={plan.current}
            >
              {plan.current ? (
                "Your plan"
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Upgrade
                </>
              )}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-0">
        <h2 className="border-b border-slate-100 p-5 font-semibold dark:border-slate-800">
          Invoices
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {INVOICES.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-4 text-sm">
              <span className="font-medium">{inv.id}</span>
              <span className="text-slate-400">{inv.date}</span>
              <span className="font-medium">{inv.amount}</span>
              <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {inv.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
