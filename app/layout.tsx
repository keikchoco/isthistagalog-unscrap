import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import ChatBot from "@/components/ChatBot";
import AppNav from "@/components/AppNav";

export const metadata: Metadata = {
  title: "Unscrap — Turn kitchen waste into wonder",
  description: "AI-powered smart repurposing platform for organic waste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster />
        <AppNav />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
