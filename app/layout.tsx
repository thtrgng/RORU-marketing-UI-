import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RORU Marketing",
  description: "RORU caption writing assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
