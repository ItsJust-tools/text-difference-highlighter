import type { Tool, DeserializeResult } from '@itsjust/core';
import toolConfig from './tool.config';
import type { ToolState } from './types';
import { isToolState } from './diff';

export const textDiffTool: Tool<ToolState> = {
  id: toolConfig.id,
  name: toolConfig.name,
  version: toolConfig.version,
  config: toolConfig,
  initialState: {
    original: '',
    modified: '',
    mode: 'side-by-side',
  },
  serialize: (state) => JSON.stringify(state),
  deserialize: (data): DeserializeResult<ToolState> => {
    try {
      if (isToolState(data)) {
        return { success: true, data: { original: data.original, modified: data.modified, mode: data.mode } };
      }
      return { success: false, error: 'Invalid data format: expected valid diff state' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deserialization error';
      return { success: false, error: `Failed to deserialize state: ${message}` };
    }
  },
};

/** Class-based helper retained for tests and non-hook consumers. */
export class TextDiffToolDefinition {
  id = toolConfig.id;
  name = toolConfig.name;
  version = toolConfig.version;
  config = toolConfig;
  initialState: ToolState = textDiffTool.initialState;
  exporters = textDiffTool.exporters;

  serialize(state: ToolState): string {
    return textDiffTool.serialize(state);
  }

  deserialize(serializedOrParsed: string | unknown): DeserializeResult<ToolState> {
    try {
      const parsed: unknown =
        typeof serializedOrParsed === 'string' ? JSON.parse(serializedOrParsed) : serializedOrParsed;
      return textDiffTool.deserialize(parsed);
    } catch {
      return { success: false, error: 'Invalid data format: expected valid diff state' };
    }
  }
}

// Back-compat aliases used by earlier tests/exports
export const yamlToJsonTool = textDiffTool;
export { textDiffTool as diffToolDefinition };
export { TextDiffToolDefinition as YamlToJsonToolDefinition };
