"use client";
import { useEffect, useState } from "react";
import type { BrandKit } from "@/types";
import BrandClient from "./BrandClient";

export default function BrandPage() {
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brand").then((r) => r.json()).then(setBrandKit).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, color: "#94a3b8" }}>Loading…</div>;
  return <BrandClient brandKit={brandKit} />;
}
