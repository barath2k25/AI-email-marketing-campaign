import { Router } from "express";
import { db, cuid, type BrandKit } from "../data/store.js";

const router = Router();
const WS = "ws_default";

router.get("/", (_req, res) => {
  const { brandKit } = db.get();
  res.json(brandKit);
});

router.post("/", (req, res) => {
  const { companyName, tagline, primaryColor, tone, audience, sampleEmail } = req.body as Partial<BrandKit>;
  const store = db.get();

  if (!store.brandKit) {
    store.brandKit = {
      id: cuid(),
      workspaceId: WS,
      companyName: companyName ?? "",
      tagline: tagline ?? "",
      primaryColor: primaryColor ?? "#6366f1",
      logoUrl: null,
      tone: tone ?? "friendly and professional",
      audience: audience ?? "",
      sampleEmail: sampleEmail ?? "",
      updatedAt: new Date().toISOString(),
    };
  } else {
    if (companyName !== undefined) store.brandKit.companyName = companyName;
    if (tagline !== undefined) store.brandKit.tagline = tagline;
    if (primaryColor !== undefined) store.brandKit.primaryColor = primaryColor;
    if (tone !== undefined) store.brandKit.tone = tone;
    if (audience !== undefined) store.brandKit.audience = audience;
    if (sampleEmail !== undefined) store.brandKit.sampleEmail = sampleEmail;
    store.brandKit.updatedAt = new Date().toISOString();
  }

  db.save();
  res.json(store.brandKit);
});

export default router;
