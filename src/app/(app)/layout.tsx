import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { resolveDisplayName } from "@/features/auth/domain/profile";
import {
  createPersonalWorkspaceForUser,
  getActiveWorkspaceForUser,
} from "@/features/workspaces/services";
import { getSession } from "@/lib/session";

/**
 * Guard + shell for every authenticated route.
 *
 * The shell lives here rather than in each page so a soft-nav only swaps the
 * page body: sidebar state and scroll position survive navigation.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Independent reads: start both before awaiting either.
  const [user, activeWorkspace] = await Promise.all([
    getCurrentUser(),
    getActiveWorkspaceForUser(userId),
  ]);

  if (!user) redirect("/login");

  // Normally created by the Better Auth `user.create` hook. Repairing it here
  // keeps a user whose sign-up hook failed from being locked out of an app
  // where every query is workspace-scoped. The call is idempotent.
  if (!activeWorkspace) {
    await createPersonalWorkspaceForUser({
      userId,
      userName: user.name || user.email,
    });
  }

  return (
    <AppShell
      user={{ name: resolveDisplayName(user), email: user.email }}
    >
      {children}
    </AppShell>
  );
}
