import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
