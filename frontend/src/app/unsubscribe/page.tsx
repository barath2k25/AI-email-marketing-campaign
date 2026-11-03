"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function UnsubscribeInner() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) return;
    setStatus("loading");
    fetch(`/api/unsubscribe?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => { setMessage(d.message ?? "You have been unsubscribed."); setStatus("done"); })
      .catch(() => { setMessage("Something went wrong. Please try again."); setStatus("error"); });
  }, [email]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 48, maxWidth: 480, width: "100%", textAlign: "center" }}>
        {status === "loading" && <p style={{ color: "#64748b" }}>Processing…</p>}
        {status === "done" && (
          <>
            <p style={{ fontSize: 48, margin: "0 0 16px" }}>✅</p>
            <h1 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700 }}>Unsubscribed</h1>
            <p style={{ color: "#64748b", fontSize: 15 }}>{message}</p>
            <p style={{ marginTop: 12, fontSize: 13, color: "#94a3b8" }}>{email}</p>
          </>
        )}
        {status === "error" && <p style={{ color: "#ef4444" }}>{message}</p>}
        {!email && (
          <p style={{ color: "#94a3b8" }}>No email address provided.</p>
        )}
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40 }}>Loading…</div>}>
      <UnsubscribeInner />
    </Suspense>
  );
}
