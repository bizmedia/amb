# React Component Structure & Naming

## Scope

Applies to `apps/web/components/**/*.tsx`.

## Naming

- React component files must use `PascalCase`: `TasksToolbar.tsx`, `ThreadCreateDialog.tsx`.
- Folders that represent a React feature/module should use `kebab-case` or domain name, but component files inside must still be `PascalCase`.
- Exported React components must use `PascalCase` names that match the file name.

## Size & Decomposition

- Soft limit: keep one component file under ~300 lines.
- Hard warning level: if a component approaches ~500 lines, split it before adding new behavior.
- Split by responsibility:
  - `components/*` for UI blocks
  - `hooks/*` for local state/side effects
  - `utils/*` for pure helpers
  - `types.ts` for local types

## Migration Rule

When touching oversized files, prefer incremental extraction over in-place growth:

1. Move pure helpers to `utils/*`
2. Move reusable UI blocks to `components/*`
3. Keep root file as orchestration layer
