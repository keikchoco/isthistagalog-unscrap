import type { Metadata } from "next";
// @ts-ignore
import "./globals.css";
import { Toaster } from "sonner";
import ChatBot from "@/components/ChatBot";
import AppNav from "@/components/AppNav";
import localFont from "next/font/local";

const alteHaasGrotesk = localFont({
  variable: "--font-alte-haas-grotesk",
  src: [
    {
      path: "./AlteHaasGroteskRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./AlteHaasGroteskBold.ttf",
      weight: "700",
    },
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
      <body className={`${alteHaasGrotesk.className} ${alteHaasGrotesk.variable}`}>
        <Toaster />
        <AppNav />
        {children}
        {/* <ChatBot /> */}
      </body>
    </html>
  );
}
