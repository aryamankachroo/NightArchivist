import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Night Archivist",
  description: "AI investigative assistant for mixed evidence analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-noir-bg text-noir-text">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
