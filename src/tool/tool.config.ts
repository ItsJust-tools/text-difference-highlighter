import type { ToolConfig } from '@itsjust/core';

export const toolConfig = {
  id: '1795201476',
  name: 'Text Difference Highlighter',
  category: 'Text',
  description:
    'Compare two text blocks side by side and highlight word-level insertions and deletions inline.',
  version: '1.0.0',
  exportFormats: ['json' as const],
  features: {
    export: true,
    autoSave: true,
    undoRedo: true,
    sidebar: true,
    statusBar: true,
    darkMode: true,
  },
  theme: {
    brand: 'Text Difference Highlighter',
    icon: '🔀',
  },
} satisfies ToolConfig & { category: string };

export const templateBaseVersion = '1.4.0';

export default toolConfig;
