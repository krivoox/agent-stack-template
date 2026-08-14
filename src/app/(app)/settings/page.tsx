import { redirect } from "next/navigation";

import { ContentPanel } from "@/components/app-shell";
import { SurfaceHeader, SurfaceSection } from "@/components/surface-section";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { UpdateProfileForm } from "@/features/auth/components/update-profile-form";
import { resolveDisplayName } from "@/features/auth/domain/profile";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <ContentPanel
      title="Settings"
      description="Your account and preferences."
    >
      <div className="max-w-xl space-y-4">
        <SurfaceSection>
          <SurfaceHeader
            title="Profile"
            description={`Signed in as ${user.email}.`}
          />
          <UpdateProfileForm
            defaultValues={{
              displayName: resolveDisplayName(user),
              timezone: user.timezone,
            }}
          />
        </SurfaceSection>
      </div>
    </ContentPanel>
  );
}
