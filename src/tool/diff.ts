import type { DiffStats, LineChange, ToolState, WordSpan } from './types';

/** Tokenize text into words (keeping whitespace separators attached contextually). */
export function tokenizeWords(text: string): string[] {
  const tokens: string[] = [];
  const regex = /\S+\s*/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = regex.exec(text)) !== null) {
    // capture any leading whitespace skipped between matches
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    tokens.push(match[0]);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }
  return tokens;
}

function isWordToken(token: string): boolean {
  return /\S/.test(token);
}

function countWords(text: string): number {
  let count = 0;
  const regex = /\S+/g;
  while (regex.exec(text) !== null) count += 1;
  return count;
}

/** Myers-style word-level diff via LCS dynamic programming. */
export function diffWords(original: string, modified: string): WordSpan[] {
  if (original === modified) {
    return original.length > 0 ? [{ type: 'equal', text: original }] : [];
  }
  const a: string[] = tokenizeWords(original);
  const b: string[] = tokenizeWords(modified);
  const n = a.length;
  const m = b.length;
  // LCS table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  // Walk to build spans, merging consecutive same-type tokens.
  const spans: WordSpan[] = [];
  const pushSpan = (type: WordSpan['type'], text: string) => {
    const last = spans[spans.length - 1];
    if (last && last.type === type) {
      last.text += text;
    } else {
      spans.push({ type, text });
    }
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      pushSpan('equal', a[i]!);
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      pushSpan('deleted', a[i]!);
      i++;
    } else {
      pushSpan('inserted', b[j]!);
      j++;
    }
  }
  while (i < n) {
    pushSpan('deleted', a[i]!);
    i++;
  }
  while (j < m) {
    pushSpan('inserted', b[j]!);
    j++;
  }
  return spans;
}

/** Word-level diff with paired whitespace tokens folded into neighboring word tokens. */
export function diffWordsInline(original: string, modified: string): WordSpan[] {
  // For display we merge whitespace-only tokens into adjacent diffs so spacing renders naturally.
  return diffWords(original, modified);
}

/** Line-by-line diff: added/removed/unchanged lines with line numbers. */
export function diffLines(original: string, modified: string): LineChange[] {
  const a: string[] = original.split('\n');
  const b: string[] = modified.split('\n');
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }
  const changes: LineChange[] = [];
  let i = 0;
  let j = 0;
  let origLine = 1;
  let modLine = 1;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      changes.push({
        type: 'unchanged',
        text: a[i]!,
        lineNumberOriginal: origLine,
        lineNumberModified: modLine,
      });
      i++;
      j++;
      origLine++;
      modLine++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      changes.push({ type: 'removed', text: a[i]!, lineNumberOriginal: origLine, lineNumberModified: null });
      i++;
      origLine++;
    } else {
      changes.push({ type: 'added', text: b[j]!, lineNumberOriginal: null, lineNumberModified: modLine });
      j++;
      modLine++;
    }
  }
  while (i < n) {
    changes.push({ type: 'removed', text: a[i]!, lineNumberOriginal: origLine, lineNumberModified: null });
    i++;
    origLine++;
  }
  while (j < m) {
    changes.push({ type: 'added', text: b[j]!, lineNumberOriginal: null, lineNumberModified: modLine });
    j++;
    modLine++;
  }
  return changes;
}

/** Statistics: added/removed words and unchanged word percentage per text. */
export function computeStats(original: string, modified: string): DiffStats {
  const spans = diffWords(original, modified);
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const span of spans) {
    const words = countWords(span.text);
    if (span.type === 'inserted') added += words;
    else if (span.type === 'deleted') removed += words;
    else unchanged += words;
  }
  const totalOriginal = countWords(original);
  const totalModified = countWords(modified);
  // Unchanged words appear in equal spans; attribute percentage per text.
  const pctOriginal = totalOriginal === 0 ? 100 : Math.round((unchanged / totalOriginal) * 100);
  const pctModified = totalModified === 0 ? 100 : Math.round((unchanged / totalModified) * 100);
  return {
    addedWords: added,
    removedWords: removed,
    unchangedWords: unchanged,
    unchangedPercentageOriginal: Math.max(0, Math.min(100, pctOriginal)),
    unchangedPercentageModified: Math.max(0, Math.min(100, pctModified)),
  };
}

/** Serialize diff spans to a unified-diff-like plain text. */
export function toUnifiedDiffText(original: string, modified: string): string {
  const lines = diffLines(original, modified);
  const out: string[] = [];
  for (const change of lines) {
    if (change.type === 'added') out.push(`+ ${change.text}`);
    else if (change.type === 'removed') out.push(`- ${change.text}`);
    else out.push(`  ${change.text}`);
  }
  return out.join('\n');
}

/** Render inline annotated view: merged text with insertions/deletions marked. */
export function toInlineText(original: string, modified: string): string {
  const spans = diffWords(original, modified);
  const parts: string[] = [];
  for (const span of spans) {
    if (span.type === 'equal') parts.push(span.text);
    else if (span.type === 'inserted') parts.push(`[+${span.text}+]`);
    else parts.push(`[-${span.text}-]`);
  }
  return parts.join('');
}

export function isToolState(value: unknown): value is ToolState {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Partial<ToolState>;
  return (
    typeof v.original === 'string' &&
    typeof v.modified === 'string' &&
    (v.mode === 'side-by-side' || v.mode === 'inline')
  );
}
