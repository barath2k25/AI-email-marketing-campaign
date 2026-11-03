import { Router } from "express";
import { db, cuid, type Contact } from "../data/store.js";

const router = Router();
const WS = "ws_default";

router.get("/", (_req, res) => {
  const { contacts } = db.get();
  res.json(contacts.filter((c) => c.workspaceId === WS));
});

router.post("/", (req, res) => {
  const { rows } = req.body as { rows: Record<string, string>[] };
  if (!Array.isArray(rows)) {
    return res.status(400).json({ error: "rows array required" });
  }

  const store = db.get();
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const email = (row.email ?? "").trim().toLowerCase();
    if (!email) { skipped++; continue; }

    const exists = store.contacts.find((c) => c.workspaceId === WS && c.email === email);
    if (exists) { skipped++; continue; }

    const tags = row.tags
      ? row.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const now = new Date().toISOString();
    store.contacts.push({
      id: cuid(),
      workspaceId: WS,
      email,
      firstName: row.first_name ?? row.firstName ?? "",
      lastName: row.last_name ?? row.lastName ?? "",
      tags,
      customData: {},
      status: "subscribed",
      createdAt: now,
      updatedAt: now,
    });
    created++;
  }

  db.save();
  res.json({ created, skipped });
});

router.patch("/:id", (req, res) => {
  const store = db.get();
  const contact = store.contacts.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!contact) return res.status(404).json({ error: "Not found" });

  const { status, tags, firstName, lastName } = req.body as Partial<Contact>;
  if (status !== undefined) contact.status = status;
  if (tags !== undefined) contact.tags = tags;
  if (firstName !== undefined) contact.firstName = firstName;
  if (lastName !== undefined) contact.lastName = lastName;
  contact.updatedAt = new Date().toISOString();

  db.save();
  res.json(contact);
});

export default router;
