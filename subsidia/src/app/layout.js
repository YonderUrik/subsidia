import "../styles/globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { config } from "@/lib/config";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: config.appName,
  description: config.appDescription,
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="Subsidia" />
      <link rel="manifest" href="/site.webmanifest" />
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7935286005444441" crossOrigin="anonymous"></script>
      <body>
        <Analytics />
        <SpeedInsights />
        <Suspense fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-lg font-medium text-muted-foreground">Caricamento...</p>
            </div>
          </div>
        }>
          <ThemeProvider attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <AuthProvider>
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
              </div>
            </AuthProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
