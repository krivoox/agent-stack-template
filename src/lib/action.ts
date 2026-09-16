import "server-only";
import type { z } from "zod";
import { getSession } from "@/lib/session";
import {
  invalidInput,
  toActionError,
  type ActionResult,
} from "@/lib/action-result";
import {
  requireMembership,
  type MembershipContext,
} from "@/lib/tenancy";

/**
 * The four steps every Server Action must perform, in one place.
 *
 * A Server Action is a public HTTP endpoint: middleware and layout guards do
 * not protect it, so authentication, input validation and tenancy have to be
 * re-checked inside the action itself. Hand-rolling that in every file is how
 * one of them ends up missing a check.
 *
 *   authenticate → validate input → authorise workspace → run → map errors
 *
 * Example:
 *
 * ```ts
 * "use server";
 *
 * export const renameProject = defineWorkspaceAction({
 *   input: renameProjectSchema,
 *   handler: async ({ input, ctx }) => {
 *     assertCanWrite(ctx.role);
 *     await renameProjectService(input);
 *     revalidatePath("/projects");
 *   },
 * });
 * ```
 */

type ActionHandlerArgs<TInput, TCtx> = {
  input: TInput;
  ctx: TCtx;
};

export type SessionContext = {
  userId: string;
};

type DefineActionOptions<TSchema extends z.ZodTypeAny, TOutput> = {
  input?: TSchema;
  /** Map a domain `code` to specific user-facing copy for this action. */
  errors?: Record<string, string>;
  handler: (
    args: ActionHandlerArgs<z.infer<TSchema>, SessionContext>,
  ) => Promise<TOutput>;
};

type DefineWorkspaceActionOptions<TSchema extends z.ZodTypeAny, TOutput> = {
  /** Must resolve a `workspaceId`; it is what the membership check runs on. */
  input: TSchema;
  errors?: Record<string, string>;
  handler: (
    args: ActionHandlerArgs<z.infer<TSchema>, MembershipContext>,
  ) => Promise<TOutput>;
};

/** Authenticated action with no workspace scope (profile, account settings…). */
export function defineAction<TSchema extends z.ZodTypeAny, TOutput = void>({
  input: schema,
  errors,
  handler,
}: DefineActionOptions<TSchema, TOutput>) {
  return async (raw?: unknown): Promise<ActionResult<TOutput>> => {
    try {
      const session = await getSession();
      const userId = session?.user?.id;
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

/**
 * Authenticated **and** workspace-scoped action.
 *
 * The membership lookup happens before the handler runs, so a handler can never
 * touch workspace data before authorisation. Role checks beyond "is a member"
 * belong in the handler via `assertCanWrite` / `assertRole`.
 */
export function defineWorkspaceAction<
  TSchema extends z.ZodTypeAny,
  TOutput = void,
>({ input: schema, errors, handler }: DefineWorkspaceActionOptions<TSchema, TOutput>) {
  return async (raw?: unknown): Promise<ActionResult<TOutput>> => {
    try {
      const session = await getSession();
      const userId = session?.user?.id;
      if (!userId) {
        return { ok: false, error: "Sign in to continue.", code: "auth.unauthenticated" };
      }

      const input = parseOrThrow(schema, raw);
      const { workspaceId } = input as { workspaceId?: unknown };
      if (typeof workspaceId !== "string" || workspaceId.length === 0) {
        return invalidInput("Missing workspace.");
      }

      const ctx = await requireMembership(userId, workspaceId);
      const data = await handler({ input, ctx });
      return toSuccess(data);
    } catch (error) {
      if (error instanceof InputError) return invalidInput(error.message);
      return toActionError(error, errors);
    }
  };
}

/** Thrown internally so schema failures share the single catch above. */
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
