"use client";
import { useState } from "react";
import type { BrandKit } from "@/types";

interface Props { brandKit: BrandKit | null }

export default function BrandClient({ brandKit }: Props) {
  const [form, setForm] = useState({
    companyName: brandKit?.companyName ?? "",
    tagline: brandKit?.tagline ?? "",
    primaryColor: brandKit?.primaryColor ?? "#6366f1",
    tone: brandKit?.tone ?? "friendly and professional",
    audience: brandKit?.audience ?? "",
    sampleEmail: brandKit?.sampleEmail ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const previewHtml = `<div style="font-family:Arial,sans-serif;max-width:480px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
  <div style="background:${form.primaryColor};padding:20px;text-align:center;color:#fff;font-weight:bold;font-size:18px;">${form.companyName || "Company Name"}</div>
  <div style="padding:24px;color:#374151;">
    <h2 style="margin:0 0 12px;color:#111827;">Hi {{first_name}},</h2>
    <p style="margin:0 0 16px;line-height:1.6;">${form.sampleEmail || "Your sample email copy will appear here."}</p>
    <a href="#" style="display:inline-block;background:${form.primaryColor};color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">Learn More</a>
  </div>
  <div style="background:#f9fafb;padding:12px 24px;text-align:center;font-size:12px;color:#9ca3af;">© ${form.companyName} · Unsubscribe</div>
</div>`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Brand Kit</h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : saved ? "✅ Saved!" : "Save Brand Kit"}
        </button>
      </div>

      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
        This information is fed to the AI whenever you generate a campaign, so every email sounds like your brand.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Company Identity</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Company Name</label>
              <input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="Acme Corp" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Tagline</label>
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Making things better" />
            </div>
            <div>
              <label>Primary Brand Color</label>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} style={{ width: 60, height: 40, padding: 2, cursor: "pointer" }} />
                <input value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} style={{ flex: 1 }} placeholder="#6366f1" />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Voice & Audience</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Brand Tone</label>
              <select value={form.tone} onChange={(e) => set("tone", e.target.value)}>
                <option value="friendly and professional">Friendly & Professional</option>
                <option value="warm and personal">Warm & Personal</option>
                <option value="bold and direct">Bold & Direct</option>
                <option value="casual and conversational">Casual & Conversational</option>
                <option value="urgent and exciting">Urgent & Exciting</option>
                <option value="formal and authoritative">Formal & Authoritative</option>
              </select>
            </div>
            <div>
              <label>Target Audience Description</label>
              <textarea
                value={form.audience}
                onChange={(e) => set("audience", e.target.value)}
                rows={2}
                placeholder="e.g. Small business owners aged 25–45 who care about saving time"
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Sample Email Copy</h3>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748b" }}>
              Paste a real email you&apos;ve written before. The AI studies it to match your style.
            </p>
            <textarea
              value={form.sampleEmail}
              onChange={(e) => set("sampleEmail", e.target.value)}
              rows={6}
              placeholder="Hi {{first_name}}, &#10;&#10;We have an exciting update…"
              style={{ resize: "vertical", fontFamily: "monospace", fontSize: 13 }}
            />
          </div>
        </div>

        <div>
          <div className="card" style={{ position: "sticky", top: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Live Preview</h3>
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </div>
      </div>
    </div>
  );
}
