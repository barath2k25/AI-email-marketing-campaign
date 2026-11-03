"use client";
import { useState } from "react";
import type { Segment } from "@/types";

type SegmentWithCount = Segment & { campaigns?: { id: string }[] };

interface Props { segments: SegmentWithCount[] }

const FIELDS = ["email", "firstName", "lastName", "tags", "status"];
const OPS = ["contains", "not_contains", "equals", "not_equals"];

export default function SegmentsClient({ segments: initial }: Props) {
  const [segments, setSegments] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState([{ field: "tags", op: "contains", value: "" }]);
  const [aiDesc, setAiDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  function addRule() { setRules((r) => [...r, { field: "tags", op: "contains", value: "" }]); }
  function removeRule(i: number) { setRules((r) => r.filter((_, idx) => idx !== i)); }
  function updateRule(i: number, k: string, v: string) {
    setRules((r) => r.map((rule, idx) => idx === i ? { ...rule, [k]: v } : rule));
  }

  async function generateFromAi() {
    if (!aiDesc.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/segments/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: aiDesc }),
      });
      const data = await res.json();
      if (data.rules) setRules(data.rules);
      if (!name) setName(aiDesc.substring(0, 40));
    } finally {
      setAiLoading(false);
    }
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, rules }),
      });
      const data = await res.json();
      setSegments((s) => [{ ...data, campaigns: [] }, ...s]);
      setShowForm(false);
      setName(""); setDescription(""); setRules([{ field: "tags", op: "contains", value: "" }]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Segments</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>+ New Segment</button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Create Segment</h3>

          <div style={{ background: "#ede9fe", padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <label style={{ color: "#5b21b6" }}>🤖 Describe your audience in plain English</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} placeholder="e.g. VIP customers tagged newsletter" />
              <button className="btn btn-primary" style={{ whiteSpace: "nowrap" }} onClick={generateFromAi} disabled={aiLoading}>
                {aiLoading ? "…" : "Generate"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Segment name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP Subscribers" />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label>Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          </div>

          <label>Rules (all must match)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {rules.map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={rule.field} onChange={(e) => updateRule(i, "field", e.target.value)} style={{ flex: 1 }}>
                  {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={rule.op} onChange={(e) => updateRule(i, "op", e.target.value)} style={{ flex: 1 }}>
                  {OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <input value={rule.value} onChange={(e) => updateRule(i, "value", e.target.value)} placeholder="value" style={{ flex: 1 }} />
                <button className="btn btn-secondary" style={{ padding: "8px 10px" }} onClick={() => removeRule(i)}>✕</button>
              </div>
            ))}
            <button className="btn btn-secondary" onClick={addRule} style={{ alignSelf: "flex-start" }}>+ Add rule</button>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Segment"}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {segments.map((s) => (
          <div key={s.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 15 }}>{s.name}</p>
                {s.description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{s.description}</p>}
              </div>
              <span className="badge badge-blue">{(s.campaigns ?? []).length} campaign{(s.campaigns ?? []).length !== 1 ? "s" : ""}</span>
            </div>
            {Array.isArray(s.rules) && s.rules.length > 0 && (
              <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {s.rules.map((r, i) => (
                  <span key={i} className="badge badge-gray">{r.field} {r.op} &quot;{r.value}&quot;</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {segments.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>No segments yet.</div>
        )}
      </div>
    </div>
  );
}
