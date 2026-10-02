const QUOTE_HEADERS = [
  /^\s*On .{0,300}wrote:\s*$/i,
  /^\s*-{2,}\s*(Original|Forwarded) Message\s*-{2,}/i,
  /^\s*_{8,}\s*$/,
  /^\s*From:\s.+$/i,
];

const SIGNATURE_MARKERS = [
  /^\s*--\s*$/,
  /^\s*(best|kind|warm|many thanks|thanks|thank you|regards|cheers|sincerely)[\w ,!.]*$/i,
  /^\s*sent from my (iphone|android|mobile|ipad)/i,
];

const DISCLAIMER = /(confidential|intended (solely )?for the (use of the )?(named )?(addressee|recipient)|if you (have )?received this (e-?mail|message) in error)/i;

export function cleanEmailBody(body: string, maxChars = 3000): string {
  const text = (body || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\\n/g, '\n');

  const rawLines = text.split('\n');
  const lines: string[] = [];

  for (const line of rawLines) {
    if (QUOTE_HEADERS.some((p) => p.test(line)) && lines.length > 0) {
      break; // cut quoted previous thread
    }
    if (line.trimStart().startsWith('>')) {
      continue;
    }
    lines.push(line.trimEnd());
  }

  // sign-off markers search in the last portion
  let cut = lines.length;
  const startIdx = Math.max(1, Math.min(Math.floor(lines.length * 0.6), lines.length - 8));
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].trim().length <= 40 && SIGNATURE_MARKERS.some((p) => p.test(lines[i]))) {
      cut = i;
      break;
    }
  }

  const prunedLines = lines.slice(0, cut);
  const paragraphs = prunedLines
    .join('\n')
    .split(/\n\s*\n/)
    .filter((p) => !DISCLAIMER.test(p));

  const cleaned = paragraphs
    .map((p) => p.trim())
    .filter(Boolean)
    .join('\n\n')
    .replace(/[ \t]+/g, ' ');

  return cleaned.slice(0, maxChars);
}

export function buildEmailState(subject: string, body: string, sender?: string, clean = true) {
  const state: Record<string, string> = {
    subject: (subject || '').trim(),
    body: clean ? cleanEmailBody(body) : (body || ''),
  };
  if (sender) {
    state['from'] = sender;
  }
  return state;
}

