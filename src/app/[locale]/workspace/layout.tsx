import { requireRole } from "@/lib/auth/server";
import WorkspaceErrorBoundary from "@/components/error-boundary/workspace-error-boundary";

// Force dynamic rendering for server-side auth
export const dynamic = "force-dynamic";

// Enterprise-level workspace layout (agent/manager/admin only)
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Server-side role check - only agents, managers, and admins can access workspace
  await requireRole(locale, ["agent", "manager", "admin"]);

  return (
    <WorkspaceErrorBoundary>
      <div className="workspace-layout">
        <main className="workspace-content">{children}</main>
      </div>
    </WorkspaceErrorBoundary>
  );
}
