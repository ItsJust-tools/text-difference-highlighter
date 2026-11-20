export type DiffMode = 'side-by-side' | 'inline';

export type LineChangeType = 'added' | 'removed' | 'unchanged';

export interface LineChange {
  type: LineChangeType;
  text: string;
  lineNumberOriginal: number | null;
  lineNumberModified: number | null;
}

export type WordDiffType = 'equal' | 'inserted' | 'deleted';

export interface WordSpan {
  type: WordDiffType;
  text: string;
}

export interface DiffStats {
  addedWords: number;
  removedWords: number;
  unchangedWords: number;
  unchangedPercentageOriginal: number;
  unchangedPercentageModified: number;
}

export interface ToolState {
  original: string;
  modified: string;
  mode: DiffMode;
}

export const SAMPLE_ORIGINAL = `The quick brown fox jumps over the lazy dog.
Pack my box with five dozen liquor jugs.
How vexingly quick daft zebras jump.
Sphinx of black quartz, judge my vow.`;

export const SAMPLE_MODIFIED = `The quick brown fox leaps over the lazy dog.
Pack my box with five dozen liquor jugs today.
How very vexingly quick daft zebras jump.
The sphinx of black quartz judges my vow.`;
