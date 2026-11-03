"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Campaign, EmailSend } from "@/types";

interface CampaignRow extends Campaign {
  sends: Pick<EmailSend, "id" | "status" | "openedAt" | "clickedAt">[];
}

const statusColor: Record<string, string> = {
  draft: "badge-gray", scheduled: "badge-blue", sending: "badge-yellow",
  sent: "badge-green", paused: "badge-red",
};

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns").then((r) => r.json()),
      fetch("/api/contacts").then((r) => r.json()),
    ]).then(([cList, contacts]) => {
      setCampaigns((cList as CampaignRow[]).slice(0, 5));
      setContactCount((contacts as { status: string }[]).filter((c) => c.status === "subscribed").length);
    }).finally(() => setLoading(false));
  }, []);

  const allSends = campaigns.flatMap((c) => c.sends ?? []);
  const total = allSends.length;
  const opens = allSends.filter((s) => s.openedAt).length;
  const clicks = allSends.filter((s) => s.clickedAt).length;
  const openRate = total > 0 ? ((opens / total) * 100).toFixed(1) : "–";
  const clickRate = total > 0 ? ((clicks / total) * 100).toFixed(1) : "–";

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>AI Email Marketing Campaign Builder</p>
        </div>
        <Link href="/campaigns/new" className="btn btn-primary">+ New Campaign</Link>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Subscribers", value: contactCount.toLocaleString(), sub: "active contacts" },
          { label: "Campaigns", value: campaigns.length, sub: "total created" },
          { label: "Open Rate", value: `${openRate}%`, sub: `${opens} / ${total} emails` },
          { label: "Click Rate", value: `${clickRate}%`, sub: `${clicks} / ${total} emails` },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Recent Campaigns</h2>
          <Link href="/campaigns" style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>View all →</Link>
        </div>

        {campaigns.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <p style={{ margin: 0, fontSize: 36 }}>📭</p>
            <p style={{ margin: "12px 0 0" }}>No campaigns yet.</p>
            <Link href="/campaigns/new" className="btn btn-primary" style={{ marginTop: 16 }}>Create your first campaign</Link>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                {["Campaign", "Status", "Created", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px", fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: "12px" }}>
                    <span className={`badge ${statusColor[c.status] ?? "badge-gray"}`}>{c.status}</span>
                  </td>
                  <td style={{ padding: "12px", color: "#64748b", fontSize: 13 }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <Link href={`/campaigns/${c.id}`} style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>Open →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
        {[
          { href: "/campaigns/new", icon: "🤖", title: "AI Generate Campaign", desc: "Describe your goal, AI writes the emails" },
          { href: "/contacts", icon: "📤", title: "Import Contacts", desc: "Upload a CSV to add your contact list" },
          { href: "/brand", icon: "🎨", title: "Brand Kit", desc: "Set your tone, colours, and sample content" },
        ].map((q) => (
          <Link key={q.href} href={q.href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", transition: "border-color 0.2s" }}>
              <p style={{ margin: "0 0 8px", fontSize: 28 }}>{q.icon}</p>
              <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 15, color: "#0f172a" }}>{q.title}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>{q.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
