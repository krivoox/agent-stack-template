"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

/** Includes `signIn.email` and `signIn.social` (Google when configured). */
export const { signIn, signUp, signOut, useSession, getSession } = authClient;
