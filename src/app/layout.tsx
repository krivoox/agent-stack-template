import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@teispace/next-themes";
import { getTheme } from "@teispace/next-themes/server";

import { Providers } from "@/components/providers";
import { env } from "@/lib/env";
import { themeProviderOptions } from "@/lib/theme";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/app-config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(env.BETTER_AUTH_URL),
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: { capable: true, statusBarStyle: "default", title: APP_NAME },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#12151c" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read on the server so the first paint already carries the right theme
  // class; without it every load flashes the default palette.
  const initialTheme = await getTheme();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} min-h-full md:h-full`}
      suppressHydrationWarning
    >
      {/* Browser extensions inject attributes on <body> before hydration. */}
      <body
        className="flex min-h-full flex-col overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeProvider
          {...themeProviderOptions}
          initialTheme={initialTheme ?? undefined}
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
