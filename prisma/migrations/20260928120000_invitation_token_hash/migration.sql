-- Invitation tokens must not live in plaintext.
-- Pending invites issued before this migration stop working (token is now a hash).
ALTER TABLE "invitation" RENAME COLUMN "token" TO "tokenHash";
ALTER INDEX "invitation_token_key" RENAME TO "invitation_tokenHash_key";
