"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import CampaignDetail from "./CampaignDetail";
import type { Segment } from "@/types";

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaign, setCampaign] = useState<any>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/campaigns/${id}`).then((r) => { if (!r.ok) throw new Error("Campaign not found"); return r.json(); }),
      fetch("/api/segments").then((r) => r.json()),
    ])
      .then(([c, segs]) => { setCampaign(c); setSegments(segs); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;
  if (error) return <div style={{ padding: 40, color: "#ef4444" }}>{error}</div>;
  if (!campaign) return null;

  return <CampaignDetail campaign={campaign} segments={segments} />;
}
