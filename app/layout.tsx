import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Toaster } from "sonner";
import ChatBot from "@/components/ChatBot";
import AppNav from "@/components/AppNav";
import localFont from "next/font/local";

const magnetik = localFont({
  variable: "--font-magnetik",
  src: [
    { path: "./Magnetik-Thin.otf", weight: "100", style: "normal" },
    { path: "./Magnetik-Thin.otf", weight: "200", style: "normal" },
    { path: "./Magnetik-Light.otf", weight: "300", style: "normal" },
    { path: "./Magnetik-Regular.otf", weight: "400", style: "normal" },
    { path: "./Magnetik-Medium.otf", weight: "500", style: "normal" },
    { path: "./Magnetik-Bold.otf", weight: "700", style: "normal" },
    { path: "./Magnetik-ExtraBold.otf", weight: "800", style: "normal" },
  ],
});

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
      <body className={`${magnetik.className} ${magnetik.variable}`}>
        <Toaster />
        <AppNav />
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
