import "server-only";
import type { z } from "zod";
import { getSession, requireFreshSession } from "@/lib/session";
import {
  invalidInput,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import {
  requireMembership,
  type MembershipContext,
} from "@/lib/tenancy";
import {
  assertRole,
  type MembershipRole,
} from "@/features/workspaces/domain";

type ActionHandlerArgs<TInput, TCtx> = {
  input: TInput;
  ctx: TCtx;
};

export type SessionContext = {
  userId: string;
};

type DefineActionOptions<TSchema extends z.ZodTypeAny, TOutput> = {
  input?: TSchema;
  requireFresh?: boolean;
  errors?: Record<string, string>;
  handler: (
    args: ActionHandlerArgs<z.infer<TSchema>, SessionContext>,
  ) => Promise<TOutput>;
};

type DefineWorkspaceActionOptions<TSchema extends z.ZodTypeAny, TOutput> = {
  input: TSchema;
  minRole?: MembershipRole;
  requireFresh?: boolean;
  errors?: Record<string, string>;
  handler: (
    args: ActionHandlerArgs<z.infer<TSchema>, MembershipContext>,
  ) => Promise<TOutput>;
};

export function defineAction<TSchema extends z.ZodTypeAny, TOutput = void>({
  input: schema,
  requireFresh,
  errors,
  handler,
}: DefineActionOptions<TSchema, TOutput>) {
  return async (raw?: unknown): Promise<ActionResult<TOutput>> => {
    try {
      let userId: string | undefined;
      if (requireFresh) {
        ({ userId } = await requireFreshSession());
      } else {
        const session = await getSession();
        userId = session?.user?.id;
      }
      if (!userId) {
        return { ok: false, error: "Sign in to continue.", code: "auth.unauthenticated" };
      }

      const input = schema ? parseOrThrow(schema, raw) : (undefined as z.infer<TSchema>);
      const data = await handler({ input, ctx: { userId } });
      return toSuccess(data);
    } catch (error) {
      if (error instanceof InputError) return invalidInput(error.message);
      return toActionError(error, errors);
    }
  };
}

export function defineWorkspaceAction<
  TSchema extends z.ZodTypeAny,
  TOutput = void,
>({
  input: schema,
  minRole = "member",
  requireFresh,
  errors,
  handler,
}: DefineWorkspaceActionOptions<TSchema, TOutput>) {
  return async (raw?: unknown): Promise<ActionResult<TOutput>> => {
    try {
      let userId: string | undefined;
      if (requireFresh) {
        ({ userId } = await requireFreshSession());
      } else {
        const session = await getSession();
        userId = session?.user?.id;
      }
      if (!userId) {
        return { ok: false, error: "Sign in to continue.", code: "auth.unauthenticated" };
      }

      const input = parseOrThrow(schema, raw);
      const { workspaceId } = input as { workspaceId?: unknown };
      if (typeof workspaceId !== "string" || workspaceId.length === 0) {
        return invalidInput("Missing workspace.");
      }

      const ctx = await requireMembership(userId, workspaceId);
      assertRole(ctx.role, minRole);
      const data = await handler({ input, ctx });
      return toSuccess(data);
    } catch (error) {
      if (error instanceof InputError) return invalidInput(error.message);
      return toActionError(error, errors);
    }
  };
}

class InputError extends Error {}

function parseOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  raw: unknown,
): z.infer<TSchema> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new InputError(parsed.error.issues[0]?.message);
  }
  return parsed.data;
}

function toSuccess<TOutput>(data: TOutput): ActionResult<TOutput> {
  return (data === undefined
    ? { ok: true }
    : { ok: true, data }) as ActionResult<TOutput>;
}
