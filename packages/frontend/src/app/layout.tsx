import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerCore — Double-Entry Accounting Engine",
  description: "Production-grade double-entry bookkeeping engine with PostgreSQL, recursive CTEs, window functions, and materialized views.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
