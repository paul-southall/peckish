# Contributing to Peckish

Peckish is a personal project, but it's run with the discipline of a real one. The engineering practices and the project-management workflow are deliberately public.

## Before you open a PR

1. Read the [Definition of Done](./docs/dod.md). Every PR clears the same bar.
2. Read the [project-management workflow](./docs/ai-pm-workflow.md). PR descriptions, status transitions, and release notes follow the patterns there.

## How issues get filed

The issue template lives in `.github/ISSUE_TEMPLATE/`. Most issues in this repo are filed by Claude through the GitHub MCP based on the build plan, the [risk register](./docs/risks.md), or voice memos. Human contributions follow the same template.

## How PRs get reviewed

Claude does a first-pass review through the GitHub MCP. A human does the second pass and merges. See the workflow doc for what each pass checks.

## Code style

TypeScript strict mode. Zod schemas on every MCP tool boundary. Conventional commits. Lint and typecheck pass before commit. The full bar is in the Definition of Done.
