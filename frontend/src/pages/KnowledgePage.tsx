import { useQuery } from "@tanstack/react-query";
import { FileText, Link2, NotebookPen, Upload } from "lucide-react";
import { contentApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, EmptyState, PageLoader, SectionTitle } from "@/components/ui";

const KIND_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  doc: <FileText className="h-5 w-5 text-blue-500" />,
  link: <Link2 className="h-5 w-5 text-emerald-500" />,
  note: <NotebookPen className="h-5 w-5 text-amber-500" />,
};

export default function KnowledgePage() {
  const { data: docs } = useQuery({ queryKey: ["knowledge"], queryFn: contentApi.knowledge });
  if (!docs) return <PageLoader />;

  return (
    <>
      <SectionTitle
        title="Knowledge Base"
        subtitle="Brand guidelines, briefs and files your agents learn from."
        action={
          <button className="btn-primary" disabled title="Demo — upload coming in phase 2">
            <Upload className="h-4 w-4" /> Upload
          </button>
        }
      />
      {docs.length === 0 ? (
        <EmptyState title="No documents yet" description="Upload brand guidelines and briefs." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                {KIND_ICON[d.kind] ?? <FileText className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.name}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {d.summary}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {d.size_kb > 0 ? `${d.size_kb} KB · ` : ""}Added {formatDate(d.added_at)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
