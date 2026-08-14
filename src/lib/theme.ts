/**
 * Shared ThemeProvider options (attribute, storage, system default).
 * Anti-FOUC script is injected by ThemeProvider via useServerInsertedHTML.
 */
export const themeProviderOptions = {
  attribute: "class" as const,
  defaultTheme: "system" as const,
  enableSystem: true,
  storage: "hybrid" as const,
  disableTransitionOnChange: true,
};
