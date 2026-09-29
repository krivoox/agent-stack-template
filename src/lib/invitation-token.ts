import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Invitation tokens are shown once (email / URL). The database stores only
 * SHA-256(token + BETTER_AUTH_SECRET).
 */
export function hashInvitationToken(raw: string): string {
  return createHash("sha256")
    .update(`${raw}:${env.BETTER_AUTH_SECRET}`)
    .digest("hex");
}

export function generateInvitationToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashInvitationToken(raw) };
}
