import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Ecommerce Website Builder",
  description: "Generate ecommerce sites from a business brief"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}

