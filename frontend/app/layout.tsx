import type { Metadata } from "next";
import { Toaster } from "sonner";

import { AuthProvider } from "@/components/auth/auth-provider";
import { LanguageProvider } from "@/components/i18n/language-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Private Task & Idea Vault",
  description: "Local-only command center for ideas, projects, tasks, and sandbox reviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster theme="dark" richColors position="top-right" />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
