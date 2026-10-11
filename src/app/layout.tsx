import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ProgressProvider } from "@/components/progress-provider";
import { Header } from "@/components/header";
import { IntroSplash } from "@/components/intro-splash";
import { ClickEffects } from "@/components/click-effects";

export const metadata: Metadata = {
  title: "TouchQuest",
  description: "Your AI-powered excuse to touch grass.",
};

export const viewport: Viewport = {
  themeColor: "#070b09",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <IntroSplash />
        <ClickEffects />
        <ProgressProvider>
          <Header />
          <main className="mx-auto w-full max-w-2xl px-4 py-8">{children}</main>
        </ProgressProvider>
      </body>
    </html>
  );
}