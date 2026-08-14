"use server";

import { revalidatePath } from "next/cache";

import { defineAction } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/features/auth/schemas";

/**
 * Not workspace-scoped: a profile belongs to the user, so `defineAction` is
 * enough. `ctx.userId` — never a client-supplied id — decides which row is
 * written.
 */
export const updateProfileAction = defineAction({
  input: updateProfileSchema,
  handler: async ({ input, ctx }) => {
    await prisma.user.update({
      where: { id: ctx.userId },
      data: { displayName: input.displayName, timezone: input.timezone },
    });
    revalidatePath("/", "layout");
  },
});
