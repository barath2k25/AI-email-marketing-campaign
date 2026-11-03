"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { EmailSend } from "@/types";

interface CampaignRow {
  id: string;
  name: string;
  goal: string;
  status: string;
  createdAt: string;
  sends: Pick<EmailSend, "id" | "openedAt" | "clickedAt">[];
  segment: { name: string } | null;
  variants: { id: string }[];
}

const statusColor: Record<string, string> = {
  draft: "badge-gray", scheduled: "badge-blue", sending: "badge-yellow",
  sent: "badge-green", paused: "badge-red",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns").then((r) => r.json()).then(setCampaigns).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Campaigns</h1>
        <Link href="/campaigns/new" className="btn btn-primary">+ New Campaign</Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: 48, margin: 0 }}>📭</p>
          <p style={{ color: "#64748b", marginTop: 12 }}>No campaigns yet. Let AI write your first one.</p>
          <Link href="/campaigns/new" className="btn btn-primary" style={{ marginTop: 20 }}>Create Campaign</Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Campaign", "Status", "Segment", "Sends", "Open Rate", "Created", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const total = c.sends.length;
                const opens = c.sends.filter((s) => s.openedAt).length;
                const openRate = total > 0 ? `${((opens / total) * 100).toFixed(0)}%` : "–";
                return (
                  <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                      {c.goal && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{c.goal}</p>}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span className={`badge ${statusColor[c.status] ?? "badge-gray"}`}>{c.status}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{c.segment?.name ?? "–"}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{total}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{openRate}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#94a3b8" }}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Link href={`/campaigns/${c.id}`} style={{ fontSize: 13, color: "#6366f1", textDecoration: "none" }}>Open →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
