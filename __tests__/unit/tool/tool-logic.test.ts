import { describe, it, expect } from 'vitest';
import { textDiffTool } from '@/tool/tool-definition';
import type { ToolState } from '@/tool/types';

describe('Text diff logic', () => {
  it('initializes with empty state', () => {
    expect(textDiffTool.initialState.original).toBe('');
    expect(textDiffTool.initialState.modified).toBe('');
    expect(textDiffTool.initialState.mode).toBe('side-by-side');
  });

  it('updates text state', () => {
    const state: ToolState = { ...textDiffTool.initialState, original: 'Hello world' };
    expect(state.original).toBe('Hello world');
  });
});

describe('Text diff deserialize', () => {
  it('accepts valid state object', () => {
    const result = textDiffTool.deserialize({ original: 'a', modified: 'b', mode: 'inline' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ original: 'a', modified: 'b', mode: 'inline' });
    }
  });

  it('rejects null data', () => {
    const result = textDiffTool.deserialize(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects non-object data', () => {
    const result = textDiffTool.deserialize('string');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects object without texts', () => {
    const result = textDiffTool.deserialize({ mode: 'side-by-side' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('rejects invalid mode', () => {
    const result = textDiffTool.deserialize({ original: 'a', modified: 'b', mode: 'other' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid data');
    }
  });

  it('round-trips state through serialize/deserialize', () => {
    const state: ToolState = { original: 'Test', modified: 'Test two', mode: 'inline' };
    const json = textDiffTool.serialize(state);
    expect(() => JSON.parse(json)).not.toThrow();
    const result = textDiffTool.deserialize(JSON.parse(json));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(state);
    }
  });
});
