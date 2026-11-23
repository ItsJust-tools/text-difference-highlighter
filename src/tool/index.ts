export { default as toolConfig } from './tool.config';
export { templateBaseVersion } from './tool.config';
export { templateMetadata, getPublicSiteUrl } from './template-metadata';
export {
  textDiffTool,
  TextDiffToolDefinition,
  yamlToJsonTool,
  YamlToJsonToolDefinition,
} from './tool-definition';
export {
  diffWords,
  diffLines,
  computeStats,
  toUnifiedDiffText,
  toInlineText,
  isToolState,
} from './diff';
export { ToolCanvas, TextDiffCanvas } from './components/tool-canvas';
export { ToolToolbar, TextDiffToolbar } from './components/tool-toolbar';
export { ToolSidebar, TextDiffSidebar } from './components/tool-sidebar';
export type { ToolState, DiffMode, LineChange, WordSpan, DiffStats } from './types';
