"use client";
import { useEffect, useState } from "react";
import type { Segment } from "@/types";
import SegmentsClient from "./SegmentsClient";

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/segments").then((r) => r.json()).then(setSegments).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;
  return <SegmentsClient segments={segments} />;
}
