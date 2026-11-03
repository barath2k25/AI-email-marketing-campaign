export interface CampaignSection {
  type: "header" | "body" | "cta" | "footer";
  content: string;
}

export interface GeneratedVariant {
  label: string;
  subject: string;
  previewText: string;
  sections: CampaignSection[];
  htmlBody: string;
  textBody: string;
}

export interface GenerateCampaignInput {
  goal: string;
  offer?: string;
  tone: string;
  audience: string;
  companyName: string;
  primaryColor: string;
  sampleEmail?: string;
  variantCount?: number;
}

const TONES: Record<string, string> = {
  "friendly and professional": "warm but polished",
  "urgent and excited": "high-energy and action-driven",
  "warm and personal": "heartfelt and conversational",
  "bold and direct": "punchy and no-nonsense",
  "casual and conversational": "relaxed and chatty",
};

function goalKeywords(goal: string): string[] {
  return goal
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(" ")
    .filter((w) => w.length > 4)
    .slice(0, 5);
}

function buildHtml(company: string, color: string, heading: string, paragraphs: string[], cta: string): string {
  const bodyLines = paragraphs
    .map((p) => `<p style="margin:0 0 16px;line-height:1.6;color:#374151;">${p}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
  <tr>
    <td style="background:${color};padding:32px 40px;text-align:center;">
      <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;">${company}</p>
    </td>
  </tr>
  <tr>
    <td style="padding:40px;">
      <h1 style="margin:0 0 24px;font-size:26px;color:#111827;line-height:1.3;">${heading}</h1>
      ${bodyLines}
      <div style="text-align:center;margin:32px 0;">
        <a href="#" style="display:inline-block;background:${color};color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:bold;font-size:16px;">${cta}</a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:#f9fafb;padding:24px 40px;text-align:center;border-top:1px solid #e5e7eb;">
      <p style="margin:0;font-size:12px;color:#6b7280;">© ${new Date().getFullYear()} ${company}. All rights reserved.</p>
      <p style="margin:8px 0 0;font-size:12px;color:#6b7280;">
        <a href="{{unsubscribe_url}}" style="color:#6b7280;">Unsubscribe</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

export function generateCampaignMock(input: GenerateCampaignInput): GeneratedVariant[] {
  const count = Math.min(input.variantCount ?? 3, 3);
  const company = input.companyName || "Our Company";
  const color = input.primaryColor || "#6366f1";
  const tone = TONES[input.tone] ?? input.tone;
  const keywords = goalKeywords(input.goal);
  const offerLine = input.offer ? `\n\n${input.offer}` : "";
  const audience = input.audience || "our valued subscribers";

  const templates = [
    {
      label: "A",
      subjectFn: () => `${company}: ${keywords[0] ? capitalize(keywords[0]) + " — " : ""}An Important Update for You`,
      previewFn: () => `Here's what we have for ${audience.split(" ").slice(0, 3).join(" ")}`,
      headingFn: () => `Hello {{first_name}}, We Have Something for You`,
      paragraphsFn: () => [
        `We're reaching out because we have something exciting that aligns perfectly with your needs.`,
        `${input.goal}${offerLine}`,
        `As part of our ${tone} approach, we want to make sure you don't miss out on this opportunity. ${audience ? `We've designed this specifically for ${audience}.` : ""}`,
      ],
      cta: "Learn More",
    },
    {
      label: "B",
      subjectFn: () => `{{first_name}}, don't miss this — ${keywords.slice(0, 2).join(" & ") || "exclusive offer"}`,
      previewFn: () => `A special message just for you from ${company}`,
      headingFn: () => `Your Exclusive Opportunity is Here`,
      paragraphsFn: () => [
        `Hi {{first_name}}, we know your time is valuable, so we'll get straight to the point.`,
        `${input.goal}`,
        `${input.offer ? `Take advantage of this: ${input.offer}.` : "This is your chance to get started."} Our ${tone} team is here to support you every step of the way.`,
      ],
      cta: "Get Started Now",
    },
    {
      label: "C",
      subjectFn: () => `The ${keywords[0] ? keywords[0] + " " : ""}update you've been waiting for from ${company}`,
      previewFn: () => `We've put this together just for you, {{first_name}}`,
      headingFn: () => `${company} Has Something Special to Share`,
      paragraphsFn: () => [
        `Dear {{first_name}}, we value your relationship with ${company} and want to keep you in the loop.`,
        `${input.goal}${offerLine}`,
        `Join the many ${audience} who are already taking advantage of what we offer. We look forward to hearing from you.`,
      ],
      cta: "Take Action",
    },
  ];

  return templates.slice(0, count).map((t) => {
    const heading = t.headingFn();
    const paragraphs = t.paragraphsFn();
    const cta = t.cta;

    const sections: CampaignSection[] = [
      { type: "header", content: heading },
      { type: "body", content: paragraphs.join("\n\n") },
      { type: "cta", content: cta },
    ];

    const htmlBody = buildHtml(company, color, heading, paragraphs, cta);
    const textBody = [heading, ...paragraphs, `\n${cta}: [link]`, "\n---\nUnsubscribe: {{unsubscribe_url}}"].join("\n\n");

    return {
      label: t.label,
      subject: t.subjectFn(),
      previewText: t.previewFn(),
      sections,
      htmlBody,
      textBody,
    };
  });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateSegmentRulesMock(description: string): { field: string; op: string; value: string }[] {
  const lower = description.toLowerCase();
  const rules: { field: string; op: string; value: string }[] = [];

  if (lower.includes("vip")) rules.push({ field: "tags", op: "contains", value: "vip" });
  if (lower.includes("newsletter")) rules.push({ field: "tags", op: "contains", value: "newsletter" });
  if (lower.includes("subscribed") || lower.includes("active")) rules.push({ field: "status", op: "equals", value: "subscribed" });
  if (lower.includes("unsubscribed")) rules.push({ field: "status", op: "equals", value: "unsubscribed" });

  const emailMatch = lower.match(/email (?:contains?|includes?) (\w+)/);
  if (emailMatch) rules.push({ field: "email", op: "contains", value: emailMatch[1] });

  if (rules.length === 0) {
    const words = description.split(" ").filter((w) => w.length > 3);
    if (words.length > 0) rules.push({ field: "tags", op: "contains", value: words[0].toLowerCase() });
  }

  return rules;
}

export function rewriteBlockMock(content: string, instruction: string): string {
  const lower = instruction.toLowerCase();

  if (lower.includes("shorter") || lower.includes("brief")) {
    const sentences = content.split(/[.!?]+/).filter(Boolean);
    return sentences.slice(0, Math.ceil(sentences.length / 2)).join(". ").trim() + ".";
  }

  if (lower.includes("urgent") || lower.includes("urgency")) {
    return content + "\n\n⚠️ Don't wait — this offer expires soon! Act now before it's too late.";
  }

  if (lower.includes("emoji")) {
    return content
      .replace(/\bgreat\b/gi, "great ✨")
      .replace(/\bthank\b/gi, "thank 🙏")
      .replace(/\boffer\b/gi, "offer 🎁")
      .replace(/\bnow\b/gi, "now 🚀");
  }

  if (lower.includes("formal") || lower.includes("professional")) {
    return content
      .replace(/\bhi\b/gi, "Dear")
      .replace(/\bhey\b/gi, "Dear")
      .replace(/\bdon't\b/gi, "do not")
      .replace(/\byou're\b/gi, "you are")
      .replace(/\bwe're\b/gi, "we are");
  }

  if (lower.includes("casual") || lower.includes("friendly")) {
    return content
      .replace(/\bDear\b/g, "Hey")
      .replace(/\bdo not\b/g, "don't")
      .replace(/\byou are\b/g, "you're")
      .replace(/\bwe are\b/g, "we're");
  }

  // Default: return slightly modified version
  return `${content}\n\n[Rewritten per instruction: "${instruction}"]`;
}
