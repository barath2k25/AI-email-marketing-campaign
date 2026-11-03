import express from "express";
import cors from "cors";
import brandRoutes from "./routes/brand.js";
import campaignRoutes from "./routes/campaigns.js";
import contactRoutes from "./routes/contacts.js";
import segmentRoutes from "./routes/segments.js";
import { db } from "./data/store.js";

const app = express();
const PORT = Number(process.env.BACKEND_PORT ?? 4000);

app.use(cors({ origin: "http://localhost:3100" }));
app.use(express.json());

// Health check
app.get("/", (_req, res) => {
  const store = db.get();
  res.json({
    status: "ok",
    app: "AI Email Campaign Builder — Backend",
    mode: "local / in-memory store (no real DB or AI)",
    stats: {
      contacts: store.contacts.length,
      campaigns: store.campaigns.length,
      segments: store.segments.length,
    },
  });
});

// Unsubscribe endpoint
app.get("/unsubscribe", (req, res) => {
  const email = (req.query.email as string ?? "").toLowerCase();
  if (!email) return res.status(400).send("Missing email");

  const store = db.get();
  const contact = store.contacts.find((c) => c.email === email);
  if (contact) {
    contact.status = "unsubscribed";
    contact.updatedAt = new Date().toISOString();
  }

  if (!store.suppressions.find((s) => s.email === email)) {
    store.suppressions.push({
      id: `sup_${Date.now()}`,
      email,
      reason: "unsubscribe",
      createdAt: new Date().toISOString(),
    });
  }

  db.save();
  res.json({ message: `${email} has been unsubscribed.` });
});

app.use("/api/brand", brandRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/segments", segmentRoutes);

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
  console.log(`   Mode: LOCAL (in-memory store, mock AI, mock email)`);
  console.log(`   Health: http://localhost:${PORT}/\n`);
});
