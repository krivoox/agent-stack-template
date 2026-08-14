import { redirect } from "next/navigation";

import { ContentPanel } from "@/components/app-shell";
import { getSession } from "@/lib/session";
import { getActiveWorkspaceForUser } from "@/features/workspaces/services";
import { listProjects } from "@/features/projects/services";
import { NewProjectSheet } from "@/features/projects/components/new-project-sheet";
import { ProjectsList } from "@/features/projects/components/projects-list";

export const metadata = { title: "Dashboard" };

/**
 * Reference page.
 *
 * A page is thin: resolve the session and the workspace, call services, render.
 * `getSession` and `getActiveWorkspaceForUser` are memoised per request, so
 * calling them again after the layout already did costs nothing.
 */
export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const workspace = await getActiveWorkspaceForUser(userId);
  if (!workspace) redirect("/login");

  const projects = await listProjects(workspace.id);
  const canWrite = workspace.role !== "viewer";

  return (
    <ContentPanel
      title="Projects"
      description={`Everything in ${workspace.name}.`}
      actions={canWrite ? <NewProjectSheet workspaceId={workspace.id} /> : null}
    >
      <ProjectsList
        workspaceId={workspace.id}
        projects={projects}
        canWrite={canWrite}
      />
    </ContentPanel>
  );
}
