# Hardened Qwen Worktree Runner

Use `scripts/qwen-worktree` when dispatching local Qwen/Spark work from an isolated git worktree.

Why this exists:

- `pi` sessions can have the correct worktree `cwd` while Qwen still calls file tools with absolute paths into the parent checkout.
- This repo's Claude worktrees are nested under the main checkout at `.claude/worktrees/...`, so parent context discovery can prime the model with the main checkout path.
- The built-in `pi` `read`, `edit`, and `write` tools resolve absolute paths as-is and do not reject paths outside `cwd`.

The runner hardens all three failure points:

- Loads `.pi/extensions/workspace-guard.ts`, which overrides `read`, `edit`, and `write` and rejects paths outside the current workspace.
- Uses `--no-context-files` and injects a short explicit system prompt so parent checkout context is not loaded.
- Enables only `read`, `edit`, and `write`; it does not give Qwen `bash`.
- Compares the parent checkout tracked status before and after the run and exits non-zero if it changed.

Usage:

```bash
scripts/qwen-worktree 'Edit src/components/Foo.tsx. Use relative paths only.'
```

Pass condition:

- Qwen may edit files inside the current worktree.
- The parent checkout must remain unchanged.
- If Qwen tries an absolute parent-checkout path, the file tool returns `Workspace guard blocked path outside cwd`.
