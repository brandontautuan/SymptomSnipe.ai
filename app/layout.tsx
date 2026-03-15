import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseSnipe.ai",
  description: "Multi-agent courtroom simulation — Prosecutor, Defendant, and Judge agents",
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
