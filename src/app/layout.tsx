import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OST Tool",
  description: "AI-powered Opportunity-Solution Tree for product discovery",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
