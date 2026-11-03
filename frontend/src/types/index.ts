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
  campaigns?: { id: string }[];
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
  variants?: EmailVariant[];
  segment?: Segment | null;
  sends?: Pick<EmailSend, "id" | "status" | "openedAt" | "clickedAt">[];
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
