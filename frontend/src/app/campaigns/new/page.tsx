"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    goal: "",
    offer: "",
    tone: "friendly and professional",
    audience: "",
    variantCount: "3",
    segmentId: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function generate() {
    if (!form.goal.trim()) { setError("Please describe your campaign goal."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.push(`/campaigns/${data.id}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>New Campaign</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>Describe your goal — AI writes the emails</p>
      </div>

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: s <= step ? "#6366f1" : "#e2e8f0", transition: "background 0.3s" }} />
        ))}
      </div>

      {step === 1 && (
        <div className="card">
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>📧 Campaign basics</h2>
          <div style={{ marginBottom: 16 }}>
            <label>Campaign name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Summer Sale 2025" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Campaign goal *</label>
            <textarea
              value={form.goal}
              onChange={(e) => set("goal", e.target.value)}
              rows={3}
              placeholder="e.g. Promote our 30% summer sale on all products. Drive clicks to the shop page."
              style={{ resize: "vertical" }}
            />
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>Be specific — the AI uses this to write your emails.</p>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Offer / CTA (optional)</label>
            <input value={form.offer} onChange={(e) => set("offer", e.target.value)} placeholder="e.g. 30% off — code SUMMER30 — shop now" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }}
            onClick={() => { if (!form.goal.trim()) { setError("Campaign goal is required."); return; } setError(""); setStep(2); }}>
            Continue →
          </button>
          {error && <p style={{ color: "#ef4444", marginTop: 12, fontSize: 13 }}>{error}</p>}
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>🎯 Audience & tone</h2>
          <div style={{ marginBottom: 16 }}>
            <label>Who is this for?</label>
            <input value={form.audience} onChange={(e) => set("audience", e.target.value)} placeholder="e.g. small business owners who bought last month" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Tone</label>
            <select value={form.tone} onChange={(e) => set("tone", e.target.value)}>
              <option value="friendly and professional">Friendly & Professional</option>
              <option value="urgent and excited">Urgent & Excited</option>
              <option value="warm and personal">Warm & Personal</option>
              <option value="bold and direct">Bold & Direct</option>
              <option value="casual and conversational">Casual & Conversational</option>
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>Number of variants (A/B test)</label>
            <select value={form.variantCount} onChange={(e) => set("variantCount", e.target.value)}>
              <option value="1">1 (no A/B test)</option>
              <option value="2">2 variants</option>
              <option value="3">3 variants</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>🤖 Ready to generate</h2>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
              <strong>Goal:</strong> {form.goal}<br />
              {form.offer && <><strong>Offer:</strong> {form.offer}<br /></>}
              <strong>Tone:</strong> {form.tone}<br />
              {form.audience && <><strong>Audience:</strong> {form.audience}<br /></>}
              <strong>Variants:</strong> {form.variantCount}
            </p>
          </div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
            The AI will generate {form.variantCount} complete email variant(s) with subject lines, body copy, and HTML — using your brand kit settings.
          </p>
          {error && <p style={{ color: "#ef4444", marginBottom: 12, fontSize: 13 }}>{error}</p>}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
              onClick={generate}
              disabled={loading}
            >
              {loading ? "⏳ Generating…" : "🤖 Generate Campaign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
