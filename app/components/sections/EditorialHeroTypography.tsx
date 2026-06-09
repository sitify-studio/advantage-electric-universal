'use client';

import { useMemo, type ReactNode } from 'react';
import { useHeroEditorialFonts } from '@/app/hooks/useHeroEditorialFonts';
import { cn } from '@/app/lib/utils';

type EditorialSegment = { kind: 'sans' | 'script'; text: string };
type EditorialLine = { segments: EditorialSegment[] };

function isItalicMark(marks: unknown): boolean {
  if (!Array.isArray(marks)) return false;
  return marks.some((m) => {
    if (typeof m !== 'object' || m === null) return false;
    const type = (m as { type?: string }).type;
    return type === 'italic' || type === 'em';
  });
}

function parseInlineSegments(nodes: unknown[]): EditorialSegment[] {
  const segments: EditorialSegment[] = [];

  for (const node of nodes) {
    if (typeof node === 'string') {
      if (node) segments.push({ kind: 'sans', text: node });
      continue;
    }
    if (typeof node !== 'object' || node === null) continue;

    const record = node as { type?: string; text?: string; content?: unknown[]; marks?: unknown[] };

    if (record.type === 'text' && typeof record.text === 'string') {
      segments.push({
        kind: isItalicMark(record.marks) ? 'script' : 'sans',
        text: record.text,
      });
      continue;
    }

    if (record.type === 'hardBreak') {
      segments.push({ kind: 'sans', text: '\n' });
      continue;
    }

    if (Array.isArray(record.content)) {
      segments.push(...parseInlineSegments(record.content));
    }
  }

  return mergeAdjacentSegments(segments);
}

function mergeAdjacentSegments(segments: EditorialSegment[]): EditorialSegment[] {
  const merged: EditorialSegment[] = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    const last = merged[merged.length - 1];
    if (last && last.kind === seg.kind) {
      last.text += seg.text;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function normalizeTiptapDoc(content: unknown): { type: string; content?: unknown[] } | null {
  if (content == null) return null;

  if (typeof content === 'string') {
    const trimmed = content.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('{')) {
      try {
        return normalizeTiptapDoc(JSON.parse(trimmed));
      } catch {
        return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: trimmed }] }] };
      }
    }
    return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: trimmed }] }] };
  }

  if (typeof content === 'object' && content !== null) {
    const doc = content as { type?: string; content?: unknown[] };
    if (doc.type === 'doc' && Array.isArray(doc.content)) return { type: 'doc', content: doc.content };
    if (Array.isArray(doc.content)) return { type: 'doc', content: doc.content };
  }

  return null;
}

function blockToLine(block: unknown): EditorialLine | null {
  if (typeof block !== 'object' || block === null) return null;
  const record = block as { type?: string; content?: unknown[] };
  const blockTypes = new Set(['paragraph', 'heading']);
  if (!record.type || !blockTypes.has(record.type) || !Array.isArray(record.content)) return null;

  const segments = parseInlineSegments(record.content).filter((s) => s.text !== '\n');
  if (segments.length === 0) return null;
  return { segments };
}

export function parseEditorialHeroLines(content: unknown): EditorialLine[] {
  const doc = normalizeTiptapDoc(content);
  if (!doc?.content?.length) return [];

  const lines: EditorialLine[] = [];
  for (const block of doc.content) {
    const line = blockToLine(block);
    if (line) lines.push(line);
  }

  return lines;
}

function extractTiptapPlainText(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTiptapPlainText).join('');
  if (typeof node === 'object') {
    const record = node as { text?: string; content?: unknown[] };
    if (typeof record.text === 'string') return record.text;
    if (Array.isArray(record.content)) return record.content.map(extractTiptapPlainText).join('');
  }
  return '';
}

export function hasEditorialTitleContent(content: unknown): boolean {
  return extractTiptapPlainText(content).trim().length > 0;
}

/** Layout rhythm derived from paragraph count — matches reference staircase (no fixed copy). */
export function getEditorialLineLayout(lineIndex: number, lineCount: number): string {
  if (lineCount <= 1) return 'pl-0';

  if (lineCount === 4) {
    switch (lineIndex) {
      case 0:
        return 'mt-0 pl-0';
      case 1:
        return 'mt-6 pl-[5vw] md:mt-8 md:pl-[6vw]';
      case 2:
        return '-mt-1 pl-[22vw] md:-mt-2 md:pl-[26vw]';
      case 3:
        return 'mt-4 pl-[5vw] md:mt-6 md:pl-[6vw]';
      default:
        return 'mt-4 pl-[8vw]';
    }
  }

  if (lineCount === 3) {
    switch (lineIndex) {
      case 0:
        return 'mt-0 pl-0';
      case 1:
        return 'mt-6 pl-[5vw] md:mt-8 md:pl-[7vw]';
      case 2:
        return 'mt-4 pl-[14vw] md:mt-6 md:pl-[18vw]';
      default:
        return 'mt-4 pl-0';
    }
  }

  if (lineCount === 2) {
    return lineIndex === 0
      ? 'mt-0 pl-0'
      : 'mt-6 pl-[8vw] md:mt-8 md:pl-[12vw]';
  }

  const progressiveIndents = [
    'pl-0',
    'pl-[5vw] md:pl-[6vw]',
    'pl-[11vw] md:pl-[13vw]',
    'pl-[17vw] md:pl-[20vw]',
    'pl-[23vw] md:pl-[26vw]',
    'pl-[29vw] md:pl-[32vw]',
    'pl-[34vw] md:pl-[36vw]',
  ];
  const indent = progressiveIndents[Math.min(lineIndex, progressiveIndents.length - 1)];
  return cn(lineIndex === 0 ? 'mt-0' : 'mt-5 md:mt-7', indent);
}

function segmentOverlapClass(lineIndex: number, segIndex: number, kind: 'sans' | 'script'): string {
  if (kind === 'script' && lineIndex === 0 && segIndex === 0) {
    return '-translate-y-2 md:-translate-y-3';
  }
  if (kind === 'script' && segIndex > 0) {
    return '-ml-1 sm:-ml-2 md:-ml-4';
  }
  return '';
}

function useEditorialTypeClasses() {
  const { sansStyle, scriptStyle } = useHeroEditorialFonts();

  return {
    sansStyle,
    scriptStyle,
    sansClass:
      'hero-editorial-sans text-[clamp(3.5rem,8.5vw,9rem)] leading-[0.88] tracking-[-0.04em] text-[color:var(--wb-text-main,#09090b)]',
    scriptClass:
      'hero-editorial-script text-[clamp(4.25rem,10vw,11.5rem)] leading-[0.8] tracking-normal text-[color:var(--wb-text-main,#09090b)]',
    scriptGlyphClass:
      'hero-editorial-script text-[clamp(4.75rem,11vw,12.5rem)] leading-[0.78] text-[color:var(--wb-text-main,#09090b)]',
  };
}

export function HeroSans({ children, className }: { children: ReactNode; className?: string }) {
  const { sansClass, sansStyle } = useEditorialTypeClasses();

  return (
    <span className={cn(sansClass, 'relative z-10 inline-block', className)} style={sansStyle}>
      {children}
    </span>
  );
}

export function HeroScript({
  children,
  className,
  glyph = false,
}: {
  children: ReactNode;
  className?: string;
  glyph?: boolean;
}) {
  const { scriptClass, scriptGlyphClass, scriptStyle } = useEditorialTypeClasses();

  return (
    <span
      className={cn(glyph ? scriptGlyphClass : scriptClass, 'relative z-20 inline-block', className)}
      style={scriptStyle}
    >
      {children}
    </span>
  );
}

export function EditorialHeroTitle({ content }: { content: unknown }) {
  const lines = useMemo(() => parseEditorialHeroLines(content), [content]);
  const lineCount = lines.length;
  const { sansStyle } = useHeroEditorialFonts();

  return (
    <h1
      className="hero-editorial-heading flex w-full max-w-[min(100%,88rem)] flex-col items-start"
      style={sansStyle}
    >
      {lines.map((line, lineIndex) => (
        <span
          key={`line-${lineIndex}`}
          className={cn(
            'flex w-full flex-wrap items-baseline',
            getEditorialLineLayout(lineIndex, lineCount),
          )}
        >
          {line.segments.map((segment, segIndex) =>
            segment.kind === 'script' ? (
              <HeroScript
                key={`${lineIndex}-${segIndex}`}
                className={segmentOverlapClass(lineIndex, segIndex, 'script')}
                glyph={segment.text.length === 1}
              >
                {segment.text}
              </HeroScript>
            ) : (
              <HeroSans
                key={`${lineIndex}-${segIndex}`}
                className={segmentOverlapClass(lineIndex, segIndex, 'sans')}
              >
                {segment.text}
              </HeroSans>
            ),
          )}
        </span>
      ))}
    </h1>
  );
}

