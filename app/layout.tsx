import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PACE — Small budget. Big possibilities.",
  description: "Make ₹10,000 last 30 days. Plan your spending, protect your goals, and try every money decision before you make it.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
