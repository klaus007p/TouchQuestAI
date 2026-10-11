import type { Metadata } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "TouchQuest",
  description: "Your AI-powered excuse to touch grass.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ProgressProvider>
          <Header />
          <main className="mx-auto w-full max-w-2xl px-4 py-8">{children}</main>
        </ProgressProvider>
      </body>
    </html>
  );
}