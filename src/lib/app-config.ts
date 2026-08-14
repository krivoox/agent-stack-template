/**
 * Product identity in one place.
 *
 * Rename here and the metadata, manifest, auth app name and shell copy all
 * follow. These are static strings, not environment variables: they are the
 * same in every deployment of the same product.
 */

export const APP_NAME = "Agent Stack Template";

export const APP_SHORT_NAME = "Agent Stack";

export const APP_DESCRIPTION =
  "Application template with an agent-first workflow.";

/** Where a signed-in user lands. */
export const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
