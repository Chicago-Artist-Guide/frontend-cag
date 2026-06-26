import type { ExtensionAPI } from '@earendil-works/pi-coding-agent';
import {
  createEditTool,
  createReadTool,
  createWriteTool
} from '@earendil-works/pi-coding-agent';
import { isAbsolute, relative, resolve } from 'node:path';

const cwd = process.cwd();

const resolveInsideWorkspace = (rawPath: string) => {
  const normalizedInput = rawPath.replace(/^@/, '');
  const absolutePath = resolve(cwd, normalizedInput);
  const relativePath = relative(cwd, absolutePath);

  if (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !isAbsolute(relativePath))
  ) {
    return absolutePath;
  }

  throw new Error(
    [
      `Workspace guard blocked path outside cwd: ${rawPath}`,
      `Current workspace: ${cwd}`,
      'Use a relative path inside this workspace instead.'
    ].join('\n')
  );
};

export default function workspaceGuard(pi: ExtensionAPI) {
  const readTool = createReadTool(cwd);
  const editTool = createEditTool(cwd);
  const writeTool = createWriteTool(cwd);

  pi.registerTool({
    ...readTool,
    label: 'read (workspace guarded)',
    promptGuidelines: [
      'Use read only with paths inside the current workspace. Prefer relative paths.'
    ],
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      resolveInsideWorkspace(params.path);
      return readTool.execute(toolCallId, params, signal, onUpdate, ctx);
    }
  });

  pi.registerTool({
    ...editTool,
    label: 'edit (workspace guarded)',
    promptGuidelines: [
      'Use edit only with paths inside the current workspace. Prefer relative paths.'
    ],
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      resolveInsideWorkspace(params.path);
      return editTool.execute(toolCallId, params, signal, onUpdate, ctx);
    }
  });

  pi.registerTool({
    ...writeTool,
    label: 'write (workspace guarded)',
    promptGuidelines: [
      'Use write only with paths inside the current workspace. Prefer relative paths.'
    ],
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      resolveInsideWorkspace(params.path);
      return writeTool.execute(toolCallId, params, signal, onUpdate, ctx);
    }
  });
}
