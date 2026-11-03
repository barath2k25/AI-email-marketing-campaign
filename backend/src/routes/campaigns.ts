import { Router } from "express";
import { db, cuid, type Contact } from "../data/store.js";
import { generateCampaignMock, rewriteBlockMock } from "../lib/ai.js";
import { sendEmailMock, injectMergeTags } from "../lib/email.js";

const router = Router();
const WS = "ws_default";

function resolveContacts(segmentId: string | null | undefined): Contact[] {
  const store = db.get();
  const all = store.contacts.filter((c) => c.workspaceId === WS && c.status === "subscribed");
  if (!segmentId) return all;

  const segment = store.segments.find((s) => s.id === segmentId && s.workspaceId === WS);
  if (!segment || segment.rules.length === 0) return all;

  return all.filter((contact) =>
    segment.rules.every((rule) => {
      const fieldVal = (contact as unknown as Record<string, unknown>)[rule.field];
      const value = rule.value.toLowerCase();

      if (rule.op === "contains") {
        if (Array.isArray(fieldVal)) return fieldVal.some((v) => String(v).toLowerCase().includes(value));
        return String(fieldVal ?? "").toLowerCase().includes(value);
      }
      if (rule.op === "not_contains") {
        if (Array.isArray(fieldVal)) return !fieldVal.some((v) => String(v).toLowerCase().includes(value));
        return !String(fieldVal ?? "").toLowerCase().includes(value);
      }
      if (rule.op === "equals") return String(fieldVal ?? "").toLowerCase() === value;
      if (rule.op === "not_equals") return String(fieldVal ?? "").toLowerCase() !== value;
      return true;
    })
  );
}

// GET /api/campaigns
router.get("/", (_req, res) => {
  const store = db.get();
  const campaigns = store.campaigns
    .filter((c) => c.workspaceId === WS)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((c) => ({
      ...c,
      variants: store.emailVariants.filter((v) => v.campaignId === c.id),
      segment: store.segments.find((s) => s.id === c.segmentId) ?? null,
      sends: store.emailSends.filter((s) => s.campaignId === c.id),
    }));
  res.json(campaigns);
});

// POST /api/campaigns — create + generate variants
router.post("/", async (req, res) => {
  const { name, goal, offer, tone, audience, variantCount, segmentId } = req.body as Record<string, string>;

  if (!goal?.trim()) return res.status(400).json({ error: "goal is required" });

  const store = db.get();
  const brandKit = store.brandKit;

  const variants = generateCampaignMock({
    goal,
    offer: offer ?? "",
    tone: tone ?? brandKit?.tone ?? "friendly and professional",
    audience: audience || brandKit?.audience || "subscribers",
    companyName: brandKit?.companyName || "Our Company",
    primaryColor: brandKit?.primaryColor || "#6366f1",
    sampleEmail: brandKit?.sampleEmail ?? "",
    variantCount: Number(variantCount ?? 3),
  });

  const now = new Date().toISOString();
  const campaign = {
    id: cuid(),
    workspaceId: WS,
    name: name?.trim() || `Campaign — ${new Date().toLocaleDateString()}`,
    goal,
    status: "draft",
    segmentId: segmentId || null,
    scheduledAt: null,
    sentAt: null,
    createdAt: now,
    updatedAt: now,
  };

  store.campaigns.push(campaign);

  const savedVariants = variants.map((v) => ({
    id: cuid(),
    campaignId: campaign.id,
    label: v.label,
    subject: v.subject,
    previewText: v.previewText,
    htmlBody: v.htmlBody,
    textBody: v.textBody,
    isWinner: false,
    createdAt: now,
    updatedAt: now,
  }));

  store.emailVariants.push(...savedVariants);
  db.save();

  res.status(201).json({ ...campaign, variants: savedVariants });
});

// GET /api/campaigns/:id
router.get("/:id", (req, res) => {
  const store = db.get();
  const campaign = store.campaigns.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!campaign) return res.status(404).json({ error: "Not found" });

  res.json({
    ...campaign,
    variants: store.emailVariants.filter((v) => v.campaignId === campaign.id),
    segment: store.segments.find((s) => s.id === campaign.segmentId) ?? null,
    sends: store.emailSends.filter((s) => s.campaignId === campaign.id),
  });
});

// POST /api/campaigns/:id/send
router.post("/:id/send", (req, res) => {
  const store = db.get();
  const campaign = store.campaigns.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const variants = store.emailVariants.filter((v) => v.campaignId === campaign.id);
  if (variants.length === 0) return res.status(400).json({ error: "No variants" });

  const { segmentId } = req.body as { segmentId?: string };
  const contacts = resolveContacts(segmentId ?? campaign.segmentId);

  const suppressedSet = new Set(store.suppressions.map((s) => s.email));
  const eligible = contacts.filter((c) => !suppressedSet.has(c.email));

  campaign.status = "sending";
  if (segmentId) campaign.segmentId = segmentId;

  let sent = 0;
  let errors = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < eligible.length; i++) {
    const contact = eligible[i];
    const variant = variants[i % variants.length];

    const mergeTags = {
      first_name: contact.firstName || "there",
      last_name: contact.lastName || "",
      email: contact.email,
      unsubscribe_url: `http://localhost:3100/unsubscribe?email=${encodeURIComponent(contact.email)}`,
    };

    try {
      sendEmailMock({
        to: contact.email,
        subject: injectMergeTags(variant.subject, mergeTags),
        html: injectMergeTags(variant.htmlBody, mergeTags),
        text: injectMergeTags(variant.textBody, mergeTags),
        from: "campaigns@localhost",
        headers: { "X-Campaign-Id": campaign.id, "X-Contact-Id": contact.id },
      });

      store.emailSends.push({
        id: cuid(),
        campaignId: campaign.id,
        variantId: variant.id,
        contactId: contact.id,
        status: "sent",
        sentAt: now,
        openedAt: null,
        clickedAt: null,
        createdAt: now,
      });
      sent++;
    } catch {
      errors++;
    }
  }

  campaign.status = "sent";
  campaign.sentAt = now;
  campaign.updatedAt = now;
  db.save();

  res.json({ sent, errors, total: eligible.length });
});

// POST /api/campaigns/:id/rewrite
router.post("/:id/rewrite", (req, res) => {
  const store = db.get();
  const campaign = store.campaigns.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const { variantId, instruction } = req.body as { variantId: string; instruction: string };
  const variant = store.emailVariants.find((v) => v.id === variantId && v.campaignId === campaign.id);
  if (!variant) return res.status(404).json({ error: "Variant not found" });

  const newBody = rewriteBlockMock(variant.textBody, instruction ?? "improve it");
  variant.textBody = newBody;
  variant.updatedAt = new Date().toISOString();
  db.save();

  res.json(variant);
});

// PATCH /api/campaigns/:id/variant
router.patch("/:id/variant", (req, res) => {
  const store = db.get();
  const campaign = store.campaigns.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const { variantId, subject, previewText } = req.body as { variantId: string; subject?: string; previewText?: string };
  const variant = store.emailVariants.find((v) => v.id === variantId && v.campaignId === campaign.id);
  if (!variant) return res.status(404).json({ error: "Variant not found" });

  if (subject !== undefined) variant.subject = subject;
  if (previewText !== undefined) variant.previewText = previewText;
  variant.updatedAt = new Date().toISOString();
  db.save();

  res.json(variant);
});

// POST /api/campaigns/:id/variant — add a new variant
router.post("/:id/variant", (req, res) => {
  const store = db.get();
  const campaign = store.campaigns.find((c) => c.id === req.params.id && c.workspaceId === WS);
  if (!campaign) return res.status(404).json({ error: "Not found" });

  const { subject, previewText, htmlBody, textBody, label } = req.body as Partial<{
    subject: string; previewText: string; htmlBody: string; textBody: string; label: string;
  }>;

  const now = new Date().toISOString();
  const variant = {
    id: cuid(),
    campaignId: campaign.id,
    label: label ?? "D",
    subject: subject ?? "New Variant",
    previewText: previewText ?? "",
    htmlBody: htmlBody ?? "",
    textBody: textBody ?? "",
    isWinner: false,
    createdAt: now,
    updatedAt: now,
  };

  store.emailVariants.push(variant);
  db.save();
  res.status(201).json(variant);
});

export default router;
