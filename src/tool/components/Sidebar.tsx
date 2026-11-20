'use client';

import React from 'react';
import type { ToolState } from '../types';
import { computeStats, toInlineText, toUnifiedDiffText } from '../diff';
import { SAMPLE_MODIFIED, SAMPLE_ORIGINAL } from '../types';

interface SidebarProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
}

export function TextDiffSidebar({ state, onChange }: SidebarProps) {
  const stats = computeStats(state.original, state.modified);

  return (
    <div className="p-4 space-y-6 text-sm bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full overflow-y-auto">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Statistics</h3>
        <dl className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Added words</dt>
            <dd className="font-mono text-green-700 dark:text-green-400">+{stats.addedWords}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Removed words</dt>
            <dd className="font-mono text-red-700 dark:text-red-400">−{stats.removedWords}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Unchanged words</dt>
            <dd className="font-mono text-gray-700 dark:text-gray-300">{stats.unchangedWords}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Original unchanged</dt>
            <dd className="font-mono text-gray-700 dark:text-gray-300">{stats.unchangedPercentageOriginal}%</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600 dark:text-gray-400">Modified unchanged</dt>
            <dd className="font-mono text-gray-700 dark:text-gray-300">{stats.unchangedPercentageModified}%</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Export</h3>
        <div className="space-y-2">
          <button
            onClick={() => navigator.clipboard.writeText(toUnifiedDiffText(state.original, state.modified))}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Copy result as unified diff text
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(toInlineText(state.original, state.modified))}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Copy inline annotated result
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Samples</h3>
        <div className="space-y-2">
          <button
            onClick={() => onChange({ ...state, original: SAMPLE_ORIGINAL, modified: SAMPLE_MODIFIED })}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Load sample text
          </button>
          <button
            onClick={() => onChange({ ...state, original: '', modified: '' })}
            className="w-full text-left px-3 py-2 text-xs rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Clear both texts
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Legend</h3>
        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <li><span className="inline-block px-1 rounded bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100">green</span> — inserted in modified text</li>
          <li><span className="inline-block px-1 rounded bg-red-200 text-red-900 line-through dark:bg-red-900/60 dark:text-red-100">red</span> — deleted from original text</li>
        </ul>
      </div>
    </div>
  );
}
