import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "../../data/db.json");

export interface Contact {
  id: string;
  workspaceId: string;
  email: string;
  firstName: string;
  lastName: string;
  tags: string[];
  customData: Record<string, unknown>;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Segment {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  rules: { field: string; op: string; value: string }[];
  createdAt: string;
}

export interface EmailVariant {
  id: string;
  campaignId: string;
  label: string;
  subject: string;
  previewText: string;
  htmlBody: string;
  textBody: string;
  isWinner: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailSend {
  id: string;
  campaignId: string;
  variantId: string;
  contactId: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  goal: string;
  status: string;
  segmentId: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BrandKit {
  id: string;
  workspaceId: string;
  companyName: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string | null;
  tone: string;
  audience: string;
  sampleEmail: string;
  updatedAt: string;
}

export interface Suppression {
  id: string;
  email: string;
  reason: string;
  createdAt: string;
}

export interface DB {
  brandKit: BrandKit | null;
  contacts: Contact[];
  segments: Segment[];
  campaigns: Campaign[];
  emailVariants: EmailVariant[];
  emailSends: EmailSend[];
  suppressions: Suppression[];
}

function seed(): DB {
  const now = new Date().toISOString();
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString();

  const contacts: Contact[] = [
    { id: "c1", workspaceId: "ws_default", email: "alice@example.com", firstName: "Alice", lastName: "Johnson", tags: ["vip", "newsletter"], customData: {}, status: "subscribed", createdAt: lastWeek, updatedAt: lastWeek },
    { id: "c2", workspaceId: "ws_default", email: "bob@example.com", firstName: "Bob", lastName: "Smith", tags: ["newsletter"], customData: {}, status: "subscribed", createdAt: lastWeek, updatedAt: lastWeek },
    { id: "c3", workspaceId: "ws_default", email: "carol@example.com", firstName: "Carol", lastName: "Davis", tags: ["vip"], customData: {}, status: "subscribed", createdAt: lastWeek, updatedAt: lastWeek },
    { id: "c4", workspaceId: "ws_default", email: "dave@example.com", firstName: "Dave", lastName: "Wilson", tags: [], customData: {}, status: "subscribed", createdAt: yesterday, updatedAt: yesterday },
    { id: "c5", workspaceId: "ws_default", email: "eve@example.com", firstName: "Eve", lastName: "Brown", tags: ["newsletter"], customData: {}, status: "unsubscribed", createdAt: lastWeek, updatedAt: yesterday },
  ];

  const segments: Segment[] = [
    { id: "s1", workspaceId: "ws_default", name: "VIP Customers", description: "Contacts tagged as VIP", rules: [{ field: "tags", op: "contains", value: "vip" }], createdAt: lastWeek },
    { id: "s2", workspaceId: "ws_default", name: "Newsletter Subscribers", description: "All newsletter opt-ins", rules: [{ field: "tags", op: "contains", value: "newsletter" }], createdAt: lastWeek },
  ];

  const variant1: EmailVariant = {
    id: "v1", campaignId: "camp1", label: "A",
    subject: "Welcome to Our Store — Your 20% Off Coupon Inside",
    previewText: "Claim your exclusive discount before it expires",
    htmlBody: buildSampleHtml("Welcome to Our Store", "#6366f1", "Welcome Offer", "Hello {{first_name}},\n\nThank you for joining us! As a special welcome, we're giving you 20% off your first order.\n\nUse code WELCOME20 at checkout.", "Shop Now"),
    textBody: "Hello {{first_name}},\n\nThank you for joining us! Use code WELCOME20 for 20% off.\n\nShop at our store today!\n\n---\nUnsubscribe: {{unsubscribe_url}}",
    isWinner: false, createdAt: yesterday, updatedAt: yesterday,
  };
  const variant2: EmailVariant = {
    id: "v2", campaignId: "camp1", label: "B",
    subject: "{{first_name}}, your welcome gift is waiting 🎁",
    previewText: "A special 20% discount just for you",
    htmlBody: buildSampleHtml("Welcome to Our Store", "#6366f1", "Your Gift Awaits", "Hi {{first_name}},\n\nWe saved something special for you — a 20% welcome discount on your first purchase.\n\nDon't let it go to waste!", "Claim Your Gift"),
    textBody: "Hi {{first_name}},\n\nYour 20% welcome discount is ready. Use code WELCOME20.\n\n---\nUnsubscribe: {{unsubscribe_url}}",
    isWinner: false, createdAt: yesterday, updatedAt: yesterday,
  };

  const campaigns: Campaign[] = [
    { id: "camp1", workspaceId: "ws_default", name: "Welcome Email Campaign", goal: "Welcome new subscribers and drive their first purchase with a 20% discount", status: "sent", segmentId: null, scheduledAt: null, sentAt: yesterday, createdAt: yesterday, updatedAt: yesterday },
  ];

  const emailSends: EmailSend[] = [
    { id: "es1", campaignId: "camp1", variantId: "v1", contactId: "c1", status: "sent", sentAt: yesterday, openedAt: yesterday, clickedAt: null, createdAt: yesterday },
    { id: "es2", campaignId: "camp1", variantId: "v2", contactId: "c2", status: "sent", sentAt: yesterday, openedAt: null, clickedAt: null, createdAt: yesterday },
    { id: "es3", campaignId: "camp1", variantId: "v1", contactId: "c3", status: "sent", sentAt: yesterday, openedAt: yesterday, clickedAt: yesterday, createdAt: yesterday },
  ];

  return {
    brandKit: {
      id: "bk1", workspaceId: "ws_default",
      companyName: "AcmeCorp", tagline: "Making things better",
      primaryColor: "#6366f1", logoUrl: null,
      tone: "friendly and professional", audience: "small business owners",
      sampleEmail: "Hi {{first_name}}, we have an exciting offer just for you...",
      updatedAt: now,
    },
    contacts,
    segments,
    campaigns,
    emailVariants: [variant1, variant2],
    emailSends,
    suppressions: [],
  };
}

function buildSampleHtml(company: string, color: string, heading: string, body: string, cta: string): string {
  const bodyLines = body.split(/\n+/).filter(Boolean).map((p) =>
    `<p style="margin:0 0 16px;line-height:1.6;color:#374151;">${p}</p>`
  ).join("\n");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;max-width:600px;">
  <tr><td style="background:${color};padding:32px 40px;text-align:center;">
    <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;">${company}</p>
  </td></tr>
  <tr><td style="padding:40px;">
    <h1 style="margin:0 0 24px;font-size:26px;color:#111827;">${heading}</h1>
    ${bodyLines}
    <div style="text-align:center;margin:32px 0;">
      <a href="#" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;">${cta}</a>
    </div>
  </td></tr>
  <tr><td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="margin:0;font-size:12px;color:#6b7280;">© ${new Date().getFullYear()} ${company}. All rights reserved.</p>
    <p style="margin:8px 0 0;font-size:12px;"><a href="{{unsubscribe_url}}" style="color:#6b7280;">Unsubscribe</a></p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function load(): DB {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DB_FILE)) return seed();
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8")) as DB;
  } catch {
    return seed();
  }
}

function save(db: DB): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

export function cuid(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

let _db: DB = load();

export const db = {
  get(): DB { return _db; },
  save(): void { save(_db); },
  reset(): void { _db = seed(); save(_db); },
};
