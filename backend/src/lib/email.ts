export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  headers?: Record<string, string>;
}

let sentCount = 0;

export function sendEmailMock(opts: SendEmailOptions): { messageId: string; accepted: string[] } {
  sentCount++;
  const messageId = `mock-${Date.now()}-${sentCount}@localhost`;

  console.log(`\n📧 [MOCK EMAIL #${sentCount}]`);
  console.log(`  From   : ${opts.from ?? "campaigns@localhost"}`);
  console.log(`  To     : ${opts.to}`);
  console.log(`  Subject: ${opts.subject}`);
  if (opts.headers) {
    Object.entries(opts.headers).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  }
  console.log(`  [HTML body — ${opts.html.length} chars, text body — ${(opts.text ?? "").length} chars]`);
  console.log(`  Message-ID: ${messageId}\n`);

  return { messageId, accepted: [opts.to] };
}

export function injectMergeTags(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`{{${key}}}`, value);
  }
  return result;
}

export function getSentCount(): number {
  return sentCount;
}
