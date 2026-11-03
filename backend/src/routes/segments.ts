import { Router } from "express";
import { db, cuid } from "../data/store.js";
import { generateSegmentRulesMock } from "../lib/ai.js";

const router = Router();
const WS = "ws_default";

router.get("/", (_req, res) => {
  const store = db.get();
  const segments = store.segments
    .filter((s) => s.workspaceId === WS)
    .map((s) => ({
      ...s,
      campaigns: store.campaigns.filter((c) => c.segmentId === s.id).map((c) => ({ id: c.id })),
    }));
  res.json(segments);
});

router.post("/", (req, res) => {
  const { name, description, rules } = req.body as { name: string; description?: string; rules?: unknown[] };
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const store = db.get();
  const now = new Date().toISOString();
  const segment = {
    id: cuid(),
    workspaceId: WS,
    name: name.trim(),
    description: description ?? "",
    rules: (rules ?? []) as { field: string; op: string; value: string }[],
    createdAt: now,
  };

  store.segments.push(segment);
  db.save();
  res.status(201).json(segment);
});

// AI-powered segment rule generation (mocked)
router.post("/ai", (req, res) => {
  const { description } = req.body as { description: string };
  if (!description?.trim()) return res.status(400).json({ error: "description required" });

  const rules = generateSegmentRulesMock(description);
  res.json({ rules });
});

export default router;
