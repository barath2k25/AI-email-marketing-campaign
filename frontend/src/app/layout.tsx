import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AI Email Campaign Builder",
  description: "AI-powered email marketing campaign builder — local demo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "32px", maxWidth: "1200px" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
