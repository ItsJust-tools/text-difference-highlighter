'use client';

import React, { Fragment, useMemo } from 'react';
import type { DiffMode, LineChange, ToolState, WordSpan } from '../types';
import { computeStats, diffLines, diffWords, toUnifiedDiffText, toInlineText } from '../diff';

interface CanvasProps {
  state: ToolState;
  onChange: (state: ToolState) => void;
  canvasRef?: React.RefObject<HTMLDivElement | null>;
}

const spanClass: Record<WordSpan['type'], string> = {
  equal: '',
  inserted: 'bg-green-200 text-green-900 dark:bg-green-900/60 dark:text-green-100 rounded px-0.5',
  deleted:
    'bg-red-200 text-red-900 line-through dark:bg-red-900/60 dark:text-red-100 rounded px-0.5',
};

const lineClass: Record<LineChange['type'], string> = {
  added: 'bg-green-50 dark:bg-green-950/40',
  removed: 'bg-red-50 dark:bg-red-950/40',
  unchanged: '',
};

function WordDiffView({ original, modified }: { original: string; modified: string }) {
  const spans = useMemo(() => diffWords(original, modified), [original, modified]);
  return (
    <div className="prose-sm font-mono whitespace-pre-wrap break-words text-sm leading-6 flex-1 overflow-auto p-3">
      {spans.map((span, idx) => (
        <span key={idx} className={spanClass[span.type]}>
          {span.text}
        </span>
      ))}
    </div>
  );
}

function LineDiffView({ original, modified }: { original: string; modified: string }) {
  const changes = useMemo(() => diffLines(original, modified), [original, modified]);
  return (
    <div
      className="flex-1 overflow-auto font-mono text-sm leading-6"
      role="list"
      aria-label="Line diff"
    >
      {changes.map((change, idx) => (
        <div
          key={idx}
          role="listitem"
          className={`flex gap-2 px-2 ${lineClass[change.type]}`}
          data-change={change.type}
        >
          <span className="w-10 shrink-0 text-right text-gray-400 select-none">
            {change.lineNumberOriginal ?? ''}
          </span>
          <span className="w-10 shrink-0 text-right text-gray-400 select-none">
            {change.lineNumberModified ?? ''}
          </span>
          <span className="w-4 shrink-0 text-center select-none">
            {change.type === 'added' ? '+' : change.type === 'removed' ? '−' : ''}
          </span>
          <span className="whitespace-pre-wrap break-words flex-1">{change.text}</span>
        </div>
      ))}
    </div>
  );
}

function InlineDiffView({ original, modified }: { original: string; modified: string }) {
  const spans = useMemo(() => diffWords(original, modified), [original, modified]);
  return (
    <div className="prose-sm font-mono whitespace-pre-wrap break-words text-sm leading-6 flex-1 overflow-auto p-3">
      {spans.map((span, idx) => (
        <Fragment key={idx}>
          <span className={spanClass[span.type]}>{span.text}</span>
        </Fragment>
      ))}
    </div>
  );
}

export function TextDiffCanvas({ state, onChange, canvasRef }: CanvasProps) {
  const stats = useMemo(
    () => computeStats(state.original, state.modified),
    [state.original, state.modified]
  );
  const unified = useMemo(
    () => toUnifiedDiffText(state.original, state.modified),
    [state.original, state.modified]
  );
  const inlineText = useMemo(
    () => toInlineText(state.original, state.modified),
    [state.original, state.modified]
  );

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    void label;
  };

  return (
    <div ref={canvasRef} className="flex flex-col h-full p-4 gap-4 overflow-hidden">
      {/* Input panes: side-by-side original + modified */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[30%]">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Original
            </label>
            <span className="text-xs text-gray-500">
              {stats.unchangedPercentageOriginal}% unchanged
            </span>
          </div>
          <textarea
            value={state.original}
            onChange={(e) => onChange({ ...state, original: e.target.value })}
            placeholder="Enter original text..."
            className="w-full h-28 md:h-auto md:flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            spellCheck={false}
            aria-label="Original text"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Modified
            </label>
            <span className="text-xs text-gray-500">
              {stats.unchangedPercentageModified}% unchanged
            </span>
          </div>
          <textarea
            value={state.modified}
            onChange={(e) => onChange({ ...state, modified: e.target.value })}
            placeholder="Enter modified text..."
            className="w-full h-28 md:h-auto md:flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 font-mono text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            spellCheck={false}
            aria-label="Modified text"
          />
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-700 dark:text-gray-300">
        <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
          +{stats.addedWords} added
        </span>
        <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">
          −{stats.removedWords} removed
        </span>
        <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
          {stats.unchangedWords} unchanged
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => copyText(unified, 'unified')}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Copy unified diff
          </button>
          <button
            onClick={() => copyText(inlineText, 'inline')}
            className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Copy inline result
          </button>
        </div>
      </div>

      {/* Diff views */}
      {state.mode === 'inline' ? (
        <div className="flex flex-col flex-1 min-h-0 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Inline comparison
          </div>
          <InlineDiffView original={state.original} modified={state.modified} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0 gap-4 overflow-hidden">
          <div className="flex flex-col min-h-0 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              Word diff
            </div>
            <WordDiffView original={state.original} modified={state.modified} />
          </div>
          <div className="flex flex-col min-h-0 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              Line-by-line
            </div>
            <LineDiffView original={state.original} modified={state.modified} />
          </div>
        </div>
      )}
    </div>
  );
}

export type { DiffMode };
