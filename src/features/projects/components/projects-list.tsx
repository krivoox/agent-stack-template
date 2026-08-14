"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurfaceSection } from "@/components/surface-section";
import { refreshAfterMutation } from "@/lib/navigation";
import {
  archiveProjectAction,
  restoreProjectAction,
} from "@/features/projects/actions";
import type { ProjectListItem } from "@/features/projects/services";

type ProjectsListProps = {
  workspaceId: string;
  projects: readonly ProjectListItem[];
  canWrite: boolean;
};

export function ProjectsList({
  workspaceId,
  projects,
  canWrite,
}: ProjectsListProps) {
  if (projects.length === 0) {
    return (
      <SurfaceSection className="py-10 text-center">
        <p className="text-sm font-medium text-foreground">No projects yet</p>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Create the first one to see the reference feature in action.
        </p>
      </SurfaceSection>
    );
  }

  return (
    <ul className="space-y-2">
      {projects.map((project) => (
        <ProjectRow
          key={project.id}
          workspaceId={workspaceId}
          project={project}
          canWrite={canWrite}
        />
      ))}
    </ul>
  );
}

function ProjectRow({
  workspaceId,
  project,
  canWrite,
}: {
  workspaceId: string;
  project: ProjectListItem;
  canWrite: boolean;
}) {
  const router = useRouter();
  // useTransition gives the pending flag for free and keeps the row
  // interactive while the action is in flight.
  const [isPending, startTransition] = useTransition();

  const archived = project.status === "archived";

  const toggleStatus = () => {
    startTransition(async () => {
      const action = archived ? restoreProjectAction : archiveProjectAction;
      const result = await action({ workspaceId, projectId: project.id });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      refreshAfterMutation(router);
    });
  };

  return (
    <li>
      <SurfaceSection className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">
              {project.name}
            </p>
            {archived ? <Badge variant="secondary">Archived</Badge> : null}
          </div>
          {project.description ? (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {project.description}
            </p>
          ) : null}
        </div>

        {canWrite ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleStatus}
            disabled={isPending}
            aria-label={archived ? "Restore project" : "Archive project"}
          >
            {archived ? (
              <RotateCcw className="size-4" />
            ) : (
              <Archive className="size-4" />
            )}
          </Button>
        ) : null}
      </SurfaceSection>
    </li>
  );
}
