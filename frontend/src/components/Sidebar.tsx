"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/campaigns", label: "Campaigns", icon: "📧" },
  { href: "/contacts", label: "Contacts", icon: "👥" },
  { href: "/segments", label: "Segments", icon: "🎯" },
  { href: "/brand", label: "Brand Kit", icon: "🎨" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid #e2e8f0", marginBottom: 12 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#6366f1" }}>✉️ CampaignAI</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#94a3b8" }}>AI Marketing Builder</p>
      </div>
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 20px",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              color: active ? "#6366f1" : "#475569",
              background: active ? "#ede9fe" : "transparent",
              borderRadius: "0 8px 8px 0",
              marginRight: 12,
              transition: "background 0.15s",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", padding: "20px", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#94a3b8" }}>Running locally</p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
          Backend: <span style={{ color: "#6366f1" }}>:4000</span> · Frontend: <span style={{ color: "#6366f1" }}>:3100</span>
        </p>
      </div>
    </nav>
  );
}
