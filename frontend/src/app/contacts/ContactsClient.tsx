"use client";
import { useState, useRef } from "react";
import Papa from "papaparse";
import type { Contact } from "@/types";

interface Props {
  contacts: Contact[];
  stats: { total: number; subscribed: number; unsubscribed: number; bounced: number };
}

const statusBadge: Record<string, string> = {
  subscribed: "badge-green", unsubscribed: "badge-gray", bounced: "badge-red",
};

export default function ContactsClient({ contacts: initial, stats }: Props) {
  const [contacts, setContacts] = useState(initial);
  const [search, setSearch] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number } | null>(null);
  const [addForm, setAddForm] = useState({ email: "", firstName: "", lastName: "", tags: "" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.firstName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastName.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: results.data }),
          });
          const data = await res.json();
          setImportResult({ created: data.created, skipped: data.skipped });
          const fresh = await fetch("/api/contacts");
          if (fresh.ok) setContacts(await fresh.json());
        } finally {
          setImporting(false);
          if (fileRef.current) fileRef.current.value = "";
        }
      },
    });
  }

  async function addContact() {
    if (!addForm.email) return;
    setAdding(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rows: [{
            email: addForm.email,
            first_name: addForm.firstName,
            last_name: addForm.lastName,
            tags: addForm.tags,
          }],
        }),
      });
      if (res.ok) {
        setShowAdd(false);
        setAddForm({ email: "", firstName: "", lastName: "", tags: "" });
        const fresh = await fetch("/api/contacts");
        if (fresh.ok) setContacts(await fresh.json());
      }
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Contacts</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="file" accept=".csv" ref={fileRef} onChange={handleCsv} style={{ display: "none" }} />
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()} disabled={importing}>
            {importing ? "Importing…" : "📤 Import CSV"}
          </button>
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add Contact</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total", value: stats.total },
          { label: "Subscribed", value: stats.subscribed },
          { label: "Unsubscribed", value: stats.unsubscribed },
          { label: "Bounced", value: stats.bounced },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{ flex: 1 }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {importResult && (
        <div style={{ background: "#dcfce7", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ✅ Imported {importResult.created} new contacts. {importResult.skipped} already existed.
        </div>
      )}

      {showAdd && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>Add Contact</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><label>Email *</label><input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="email@example.com" /></div>
            <div><label>First Name</label><input value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} placeholder="Jane" /></div>
            <div><label>Last Name</label><input value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} placeholder="Doe" /></div>
            <div><label>Tags (comma-separated)</label><input value={addForm.tags} onChange={(e) => setAddForm({ ...addForm, tags: e.target.value })} placeholder="vip, newsletter" /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={addContact} disabled={adding}>{adding ? "Adding…" : "Add"}</button>
            <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: "12px 16px", marginBottom: 16, background: "#f8fafc", display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <p style={{ margin: 0, fontSize: 13, color: "#475569" }}>
          CSV columns supported: <code>email</code>, <code>first_name</code>, <code>last_name</code>, <code>tags</code> (comma-separated)
        </p>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" />
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Name", "Email", "Tags", "Status", "Added"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No contacts found.</td></tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px", fontWeight: 500, fontSize: 14 }}>
                  {c.firstName || c.lastName ? `${c.firstName} ${c.lastName}`.trim() : "–"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{c.email}</td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {c.tags.map((t) => <span key={t} className="badge badge-purple">{t}</span>)}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span className={`badge ${statusBadge[c.status] ?? "badge-gray"}`}>{c.status}</span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 12, color: "#94a3b8" }}>
                  {new Date(c.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
