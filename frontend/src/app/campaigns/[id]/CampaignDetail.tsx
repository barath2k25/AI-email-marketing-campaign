"use client";
import { useState } from "react";
import type { Campaign, EmailVariant, Segment, EmailSend } from "@/types";

interface Props {
  campaign: Campaign & {
    variants: EmailVariant[];
    segment: Segment | null;
    sends: Pick<EmailSend, "id" | "status" | "openedAt" | "clickedAt">[];
  };
  segments: Segment[];
}

const statusColor: Record<string, string> = {
  draft: "badge-gray", scheduled: "badge-blue", sending: "badge-yellow",
  sent: "badge-green", paused: "badge-red",
};

export default function CampaignDetail({ campaign, segments }: Props) {
  const [activeVariant, setActiveVariant] = useState(0);
  const [previewMode, setPreviewMode] = useState<"html" | "text">("html");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; errors: number } | null>(null);
  const [selectedSegment, setSelectedSegment] = useState(campaign.segmentId ?? "");
  const [msg, setMsg] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const [editSubject, setEditSubject] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState("");

  const variant = campaign.variants[activeVariant];
  const total = campaign.sends.length;
  const opens = campaign.sends.filter((s) => s.openedAt).length;
  const clicks = campaign.sends.filter((s) => s.clickedAt).length;

  async function sendCampaign() {
    setSending(true);
    setMsg("");
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segmentId: selectedSegment || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSendResult(data);
      setMsg(`✅ Sent to ${data.sent} contacts! (check the backend terminal for email logs)`);
    } catch (e: unknown) {
      setMsg(`❌ ${e instanceof Error ? e.message : "Send failed"}`);
    } finally {
      setSending(false);
    }
  }

  async function rewriteVariant() {
    const instruction = prompt("How should I rewrite this email? (e.g. 'make it shorter', 'more urgent', 'add emojis')");
    if (!instruction) return;
    setRewriting(true);
    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, instruction }),
      });
      if (res.ok) { window.location.reload(); }
    } finally {
      setRewriting(false);
    }
  }

  async function saveSubject() {
    await fetch(`/api/campaigns/${campaign.id}/variant`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId: variant.id, subject: subjectDraft }),
    });
    setEditSubject(false);
    window.location.reload();
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{campaign.name}</h1>
            <span className={`badge ${statusColor[campaign.status] ?? "badge-gray"}`}>{campaign.status}</span>
          </div>
          {campaign.goal && <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{campaign.goal}</p>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {campaign.status === "draft" && (
            <>
              <button className="btn btn-secondary" onClick={rewriteVariant} disabled={rewriting}>
                {rewriting ? "⏳" : "🤖 AI Rewrite"}
              </button>
              <button className="btn btn-primary" onClick={sendCampaign} disabled={sending}>
                {sending ? "Sending…" : "📤 Send Now"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {total > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Sent", value: total },
            { label: "Opens", value: `${opens} (${((opens / total) * 100).toFixed(0)}%)` },
            { label: "Clicks", value: `${clicks} (${((clicks / total) * 100).toFixed(0)}%)` },
          ].map((s) => (
            <div key={s.label} className="stat-card" style={{ flex: 1 }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Send segment picker */}
      {campaign.status === "draft" && (
        <div className="card" style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
          <label style={{ marginBottom: 0, whiteSpace: "nowrap" }}>Send to segment:</label>
          <select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} style={{ flex: 1 }}>
            <option value="">All subscribers</option>
            {segments.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}

      {msg && (
        <div style={{ background: msg.startsWith("✅") ? "#dcfce7" : "#fee2e2", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          {msg}
          {sendResult && <p style={{ margin: "4px 0 0", fontSize: 12 }}>Emails are logged to the backend terminal (mock send, no real SMTP).</p>}
        </div>
      )}

      {/* Variants tabs */}
      {campaign.variants.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {campaign.variants.map((v, i) => (
            <button
              key={v.id}
              className={`btn ${i === activeVariant ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveVariant(i)}
            >
              Variant {v.label}
            </button>
          ))}
        </div>
      )}

      {variant && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>
          {/* Details panel */}
          <div>
            <div className="card" style={{ marginBottom: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>SUBJECT LINE</p>
              {editSubject ? (
                <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
                  <input value={subjectDraft} onChange={(e) => setSubjectDraft(e.target.value)} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-primary" onClick={saveSubject} style={{ flex: 1 }}>Save</button>
                    <button className="btn btn-secondary" onClick={() => setEditSubject(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{variant.subject}</p>
                  <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }}
                    onClick={() => { setSubjectDraft(variant.subject); setEditSubject(true); }}>Edit</button>
                </div>
              )}
            </div>

            {variant.previewText && (
              <div className="card" style={{ marginBottom: 12 }}>
                <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>PREVIEW TEXT</p>
                <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>{variant.previewText}</p>
              </div>
            )}

            <div className="card">
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>QUICK ACTIONS</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button className="btn btn-secondary" onClick={rewriteVariant} disabled={rewriting} style={{ justifyContent: "flex-start" }}>
                  🤖 AI Rewrite this variant
                </button>
                <div className="btn btn-secondary" style={{ justifyContent: "flex-start", background: "#f8fafc", cursor: "default", fontSize: 12 }}>
                  📬 Emails logged to backend terminal
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Email Preview</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button className={`btn ${previewMode === "html" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setPreviewMode("html")} style={{ padding: "4px 12px", fontSize: 12 }}>HTML</button>
                <button className={`btn ${previewMode === "text" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setPreviewMode("text")} style={{ padding: "4px 12px", fontSize: 12 }}>Text</button>
              </div>
            </div>
            {previewMode === "html" ? (
              <iframe
                srcDoc={variant.htmlBody}
                style={{ width: "100%", height: 600, border: "none", display: "block" }}
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <pre style={{ margin: 0, padding: 20, fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#374151", maxHeight: 600, overflow: "auto" }}>
                {variant.textBody}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
