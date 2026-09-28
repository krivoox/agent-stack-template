"use server";

import { revalidatePath } from "next/cache";

import { defineAction } from "@/lib/action";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/features/auth/schemas";

export const updateProfileAction = defineAction({
  input: updateProfileSchema,
  requireFresh: true,
  handler: async ({ input, ctx }) => {
    await prisma.user.update({
      where: { id: ctx.userId },
      data: { displayName: input.displayName, timezone: input.timezone },
    });
    revalidatePath("/", "layout");
  },
});
