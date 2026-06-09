export type SeoImage = {
  url: string;
  alt?: string;
};

function isLocalHttp(url: string): boolean {
  return /^http:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\b/i.test(url);
}

export function toHttpsExceptLocal(url: string): string {
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  if (isLocalHttp(url)) return url;
  return url.replace(/^http:\/\//i, 'https://');
}

export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return toHttpsExceptLocal(fromEnv.replace(/\/$/, ''));
  if (typeof window !== 'undefined' && window.location?.origin) {
    return toHttpsExceptLocal(window.location.origin);
  }
  return '';
}

export function buildCanonicalUrl(pathname: string): string {
  const origin = getSiteOrigin();
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return origin ? `${origin}${cleanPath}` : cleanPath;
}

export function truncate(text: string, max = 160): string {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + '…';
}

export function stripHtml(input: string): string {
  return (input || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function tiptapToText(content: unknown): string {
  if (!content) return '';

  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    const parts: string[] = [];

    const walk = (node: unknown) => {
      if (!node) return;
      if (typeof node === 'string') {
        parts.push(node);
        return;
      }
      if (typeof node !== 'object' || node === null) return;
      const n = node as { type?: string; text?: string; content?: unknown[] };
      if (n.type === 'text' && typeof n.text === 'string') {
        parts.push(n.text);
      }
      if (Array.isArray(n.content)) {
        n.content.forEach(walk);
      }
    };

    walk(doc);
    return parts.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return typeof content === 'string' ? stripHtml(content) : '';
  }
}

/** One string per block (paragraph / heading); inner hard breaks become extra lines. */
export function tiptapToLines(content: unknown, maxLines = 8): string[] {
  if (!content) return [];

  const lines: string[] = [];
  const pushLines = (raw: string) => {
    raw.split(/\n+/).forEach((part) => {
      const t = part.replace(/\s+/g, ' ').trim();
      if (t && lines.length < maxLines) lines.push(t);
    });
  };

  const blockText = (node: { content?: unknown[] }): string => {
    if (!Array.isArray(node.content)) return '';
    const parts: string[] = [];
    for (const c of node.content as { type?: string; text?: string }[]) {
      if (!c) continue;
      if (c.type === 'text' && typeof c.text === 'string') parts.push(c.text);
      if (c.type === 'hardBreak') parts.push('\n');
    }
    return parts.join('');
  };

  const visit = (node: unknown) => {
    if (!node || lines.length >= maxLines) return;
    if (typeof node !== 'object' || node === null) return;
    const n = node as { type?: string; content?: unknown[] };
    if (n.type === 'doc' && Array.isArray(n.content)) {
      n.content.forEach(visit);
      return;
    }
    if (n.type === 'paragraph' || n.type === 'heading') {
      pushLines(blockText(n));
      return;
    }
    if (Array.isArray(n.content)) n.content.forEach(visit);
  };

  try {
    const doc = typeof content === 'string' ? JSON.parse(content) : content;
    visit(doc);
    return lines;
  } catch {
    const s = typeof content === 'string' ? content : '';
    return s
      .split(/\n/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, maxLines);
  }
}

export function normalizeSeoImage(url?: string | null, alt?: string | null): SeoImage | null {
  if (!url) return null;
  return { url: toHttpsExceptLocal(url), alt: alt || undefined };
}
