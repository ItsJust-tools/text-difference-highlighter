import { describe, it, expect } from 'vitest';
import {
  diffWords,
  diffLines,
  computeStats,
  toUnifiedDiffText,
  toInlineText,
  isToolState,
  tokenizeWords,
} from '../../src/tool/diff';
import { TextDiffToolDefinition, textDiffTool } from '../../src/tool/tool-definition';
import type { ToolState } from '../../src/tool/types';

describe('tokenizeWords', () => {
  it('splits into word tokens with trailing whitespace', () => {
    expect(tokenizeWords('hello world')).toEqual(['hello ', 'world']);
  });

  it('keeps leading whitespace as its own token', () => {
    expect(tokenizeWords('  hello')).toEqual(['  ', 'hello']);
  });

  it('returns empty for empty string', () => {
    expect(tokenizeWords('')).toEqual([]);
  });
});

describe('diffWords', () => {
  it('detects insertions', () => {
    const spans = diffWords('hello world', 'hello big world');
    expect(spans).toEqual([
      { type: 'equal', text: 'hello ' },
      { type: 'inserted', text: 'big ' },
      { type: 'equal', text: 'world' },
    ]);
  });

  it('detects deletions', () => {
    const spans = diffWords('hello big world', 'hello world');
    expect(spans).toEqual([
      { type: 'equal', text: 'hello ' },
      { type: 'deleted', text: 'big ' },
      { type: 'equal', text: 'world' },
    ]);
  });

  it('detects replacements as delete+insert', () => {
    const spans = diffWords('quick fox', 'lazy fox');
    const deleted = spans.find((s) => s.type === 'deleted');
    const inserted = spans.find((s) => s.type === 'inserted');
    expect(deleted?.text.trim()).toBe('quick');
    expect(inserted?.text.trim()).toBe('lazy');
  });

  it('returns one equal span for identical non-empty text', () => {
    expect(diffWords('same text', 'same text')).toEqual([{ type: 'equal', text: 'same text' }]);
  });

  it('returns empty for both empty', () => {
    expect(diffWords('', '')).toEqual([]);
  });

  it('handles whole-text insertion and deletion', () => {
    expect(diffWords('', 'new')).toEqual([{ type: 'inserted', text: 'new' }]);
    expect(diffWords('old', '')).toEqual([{ type: 'deleted', text: 'old' }]);
  });

  it('merges consecutive span types', () => {
    const spans = diffWords('aa bb cc', 'xx yy cc');
    expect(spans.filter((s) => s.type === 'deleted')).toHaveLength(1);
    expect(spans.filter((s) => s.type === 'inserted')).toHaveLength(1);
  });
});

describe('diffLines', () => {
  it('marks added, removed and unchanged lines with numbers', () => {
    const changes = diffLines('a\nb\nc', 'a\nx\nc');
    expect(changes).toEqual([
      { type: 'unchanged', text: 'a', lineNumberOriginal: 1, lineNumberModified: 1 },
      { type: 'removed', text: 'b', lineNumberOriginal: 2, lineNumberModified: null },
      { type: 'added', text: 'x', lineNumberOriginal: null, lineNumberModified: 2 },
      { type: 'unchanged', text: 'c', lineNumberOriginal: 3, lineNumberModified: 3 },
    ]);
  });

  it('handles empty inputs', () => {
    expect(diffLines('', '')).toEqual([
      { type: 'unchanged', text: '', lineNumberOriginal: 1, lineNumberModified: 1 },
    ]);
  });

  it('counts added lines at end', () => {
    const changes = diffLines('a', 'a\nb');
    expect(changes.filter((c) => c.type === 'added')).toEqual([
      { type: 'added', text: 'b', lineNumberOriginal: null, lineNumberModified: 2 },
    ]);
  });
});

describe('computeStats', () => {
  it('reports zero-diff statistics for identical inputs', () => {
    const stats = computeStats('hello world', 'hello world');
    expect(stats.addedWords).toBe(0);
    expect(stats.removedWords).toBe(0);
    expect(stats.unchangedWords).toBe(2);
    expect(stats.unchangedPercentageOriginal).toBe(100);
    expect(stats.unchangedPercentageModified).toBe(100);
  });

  it('reports zero-diff statistics for empty inputs', () => {
    const stats = computeStats('', '');
    expect(stats.addedWords).toBe(0);
    expect(stats.removedWords).toBe(0);
    expect(stats.unchangedWords).toBe(0);
    expect(stats.unchangedPercentageOriginal).toBe(100);
    expect(stats.unchangedPercentageModified).toBe(100);
  });

  it('counts added and removed words', () => {
    const stats = computeStats('one two three', 'one two four five');
    expect(stats.addedWords).toBe(2);
    expect(stats.removedWords).toBe(1);
    expect(stats.unchangedWords).toBe(2);
  });

  it('percentages are between 0 and 100', () => {
    const stats = computeStats('a b c d e', 'x y z w v');
    expect(stats.unchangedPercentageOriginal).toBeGreaterThanOrEqual(0);
    expect(stats.unchangedPercentageOriginal).toBeLessThanOrEqual(100);
    expect(stats.unchangedPercentageModified).toBeGreaterThanOrEqual(0);
    expect(stats.unchangedPercentageModified).toBeLessThanOrEqual(100);
  });
});

describe('toUnifiedDiffText', () => {
  it('uses +/- markers', () => {
    const out = toUnifiedDiffText('same\nkeep\nold line', 'same\nkeep\nnew line');
    expect(out.split('\n')).toEqual(['  same', '  keep', '- old line', '+ new line']);
  });
});

describe('toInlineText', () => {
  it('marks insertions and deletions inline', () => {
    expect(toInlineText('hello world', 'hello big world')).toBe('hello [+big +]world');
    expect(toInlineText('hello big world', 'hello world')).toBe('hello [-big -]world');
  });

  it('returns plain text for identical inputs', () => {
    expect(toInlineText('same', 'same')).toBe('same');
  });
});

describe('isToolState', () => {
  it('accepts valid state', () => {
    expect(isToolState({ original: 'a', modified: 'b', mode: 'inline' })).toBe(true);
  });

  it('rejects invalid mode and missing fields', () => {
    expect(isToolState({ original: 'a', modified: 'b', mode: 'nope' })).toBe(false);
    expect(isToolState({ original: 'a', mode: 'inline' })).toBe(false);
    expect(isToolState(null)).toBe(false);
    expect(isToolState('x')).toBe(false);
  });
});

describe('TextDiffToolDefinition serialize/deserialize', () => {
  const def = new TextDiffToolDefinition();

  it('round-trips state', () => {
    const state: ToolState = { original: 'a b', modified: 'a c', mode: 'inline' };
    const json = def.serialize(state);
    const parsed = def.deserialize(json);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toEqual(state);
  });

  it('rejects garbage strings', () => {
    expect(def.deserialize('not json').success).toBe(false);
  });

  it('rejects valid JSON with wrong shape', () => {
    expect(def.deserialize('{"foo":1}').success).toBe(false);
  });

  it('accepts parsed object directly', () => {
    const parsed = def.deserialize({ original: '', modified: '', mode: 'side-by-side' });
    expect(parsed.success).toBe(true);
  });
});

describe('textDiffTool contract', () => {
  it('exposes id, name, config from tool.config', () => {
    expect(textDiffTool.id).toBe('1795201476');
    expect(textDiffTool.name).toBe('Text Difference Highlighter');
    expect(textDiffTool.config.name).toBe('Text Difference Highlighter');
    expect(textDiffTool.version).toBe('1.0.0');
  });

  it('initialState has empty texts and side-by-side mode', () => {
    expect(textDiffTool.initialState).toEqual({ original: '', modified: '', mode: 'side-by-side' });
  });
});
