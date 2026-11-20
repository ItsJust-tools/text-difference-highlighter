'use client';

import React from 'react';
import Link from 'next/link';
import type { ToolState } from '../types';
import { SAMPLE_MODIFIED, SAMPLE_ORIGINAL } from '../types';

interface ToolbarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  onClear: () => void;
}

export function TextDiffToolbar({ state, onChange, onClear }: ToolbarProps) {
  const loadSample = () => {
    onChange({ ...state, original: SAMPLE_ORIGINAL, modified: SAMPLE_MODIFIED });
  };

  const copyUnified = async () => {
    const { toUnifiedDiffText } = await import('../diff');
    await navigator.clipboard.writeText(toUnifiedDiffText(state.original, state.modified));
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2" role="group" aria-label="Diff mode">
        <Link href="/help" className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open help page">
          Help
        </Link>
        <button
          onClick={() => onChange({ ...state, mode: 'side-by-side' })}
          aria-pressed={state.mode === 'side-by-side'}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'side-by-side'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Side by side
        </button>
        <button
          onClick={() => onChange({ ...state, mode: 'inline' })}
          aria-pressed={state.mode === 'inline'}
          className={`px-3 py-1.5 text-xs font-medium rounded-md ${
            state.mode === 'inline'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          Inline
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={loadSample}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Load sample
        </button>
        <button
          onClick={copyUnified}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Copy unified diff
        </button>
        <button
          onClick={onClear}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
