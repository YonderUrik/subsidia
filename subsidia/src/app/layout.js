import "../styles/globals.css";
import { AuthProvider } from "../contexts/auth-context";
import { ThemeProvider } from "@/providers/theme-provider";
import { config } from "@/lib/config";
import { Toaster } from "@/components/ui/toaster";

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
      <body>
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
      </body>
    </html>
  );
}
