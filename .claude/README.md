# cadenway-api-contracts: Claude Code tooling

This `.claude/` folder ships the Claude Code tooling of cadenway-api-contracts: **10 agents**,
11 slash commands, 7 rules, 8 skills, 3 hooks, the project
settings.

Start from [AGENTS.md](../AGENTS.md) (the rules every assistant follows) and [CLAUDE.md](../CLAUDE.md)
(the Claude entry point).

## Settings (`settings.json`)

- **Hooks** are wired through `${CLAUDE_PROJECT_DIR}` so they resolve from any working directory:
  `guard.mjs` before every `Write` / `Edit` / `MultiEdit`, `guard-git.mjs` before every `Bash` /
  `PowerShell` command, and `format.mjs` after matching edit events for supported files.
  Apply the repository rules across tools.
- **Permissions** allow specific repository commands and read-only Git commands. The project
  denies `Read` on `.env` and `.env.*`. Follow the repository secret-handling rules across tools.
  The project does not pre-approve `git push`, `gh` writes or arbitrary shell commands.
- **Fast mode is off** (`fastMode: false` and `CLAUDE_CODE_DISABLE_FAST_MODE=1`). Agent models and
  efforts are explicit in each agent's frontmatter; do not silently substitute a model.
- **MCP**: `enabledMcpjsonServers` enables `context7` from the root `.mcp.json`.
- **No plugins** are enabled (`enabledPlugins: {}`). The folder is itself a plugin
  (`.claude-plugin/plugin.json`, `hooks/hooks.json`) for installations outside this checkout.

## Working with the sibling repositories

Start from this checkout and attach the peers you need, for example:

```powershell
claude --add-dir ../cadenway-api-gateway ../cadenway-task-service ../cadenway-webapp
```

Their `.claude/agents/` are discovered too, so their `cw-*` roles become available. Peer checkouts
are **read-only** from a cadenway-api-contracts session (the guard refuses edits there): change them in their
own session and pull request.

## Agents

Builders write only assigned files, inherit permissions and preserve concurrent work. Reviewers are
read-only: their tools exclude `Edit` and `Write`, and they ask the parent for the output of any
check that writes files. No agent delegates further.

| Agent | Responsibility | Model | Effort | Mode |
| --- | --- | --- | --- | --- |
| `cw-contracts-openapi-author` | Public and internal routes. | opus | high | Assigned writes |
| `cw-contracts-asyncapi-author` | Events and their payloads. | opus | high | Assigned writes |
| `cw-contracts-enum-maintainer` | Shared enumerations. | sonnet | high | Assigned writes |
| `cw-contracts-codegen-maintainer` | Generation pipeline. | sonnet | high | Assigned writes |
| `cw-contracts-docs-maintainer` | Published API documentation. | sonnet | medium | Assigned writes |
| `cw-contracts-release-manager` | Changesets and deprecations. | sonnet | medium | Assigned writes |
| `cw-contracts-breaking-change-reviewer` | Compatibility of a spec change. | opus | xhigh | Read-only |
| `cw-contracts-consistency-reviewer` | Naming and style across specs. | sonnet | high | Read-only |
| `cw-contracts-consumer-impact-reviewer` | Who must change, in which order. | sonnet | high | Read-only |
| `cw-contracts-github-maintainer` | Workflows, templates and community files in .github/. | sonnet | medium | Assigned writes |

## Commands

| Command | What it does | Runs |
| --- | --- | --- |
| `/cw-route` | Add or change a route. | `cw-contracts-openapi-author` |
| `/cw-event` | Add or change an event. | `cw-contracts-asyncapi-author` |
| `/cw-enum` | Change a shared enumeration. | `cw-contracts-enum-maintainer` |
| `/cw-codegen` | Change the generation pipeline. | `cw-contracts-codegen-maintainer` |
| `/cw-docs` | Maintain the published API docs. | `cw-contracts-docs-maintainer` |
| `/cw-release` | Prepare changesets and deprecations. | `cw-contracts-release-manager` |
| `/cw-breaking-review` | Check compatibility of a spec change. | `cw-contracts-breaking-change-reviewer` |
| `/cw-consistency-review` | Check naming and style. | `cw-contracts-consistency-reviewer` |
| `/cw-impact` | List affected repositories and their order. | `cw-contracts-consumer-impact-reviewer` |
| `/cw-github` | Change workflows, templates or community files in .github/. | `cw-contracts-github-maintainer` |
| `/cw-quality` | Run the local quality gate, stopping at the first failure. | runs the commands itself |

## Rules

| File | Subject | Loads for |
| --- | --- | --- |
| `openapi.md` | OpenAPI specs | `openapi/**` |
| `asyncapi.md` | AsyncAPI specs | `asyncapi/**` |
| `generated.md` | Generated packages | `packages/**` |
| `language.md` | Language | always |
| `git-and-commits.md` | Git and commits | always |
| `comments.md` | Comments and docblocks | `packages/**/*.ts` |
| `github.md` | GitHub files | `.github/**` |

## Skills

See [skills/](skills/) for the complete inventory, including the technology guides.

| Skill | Use |
| --- | --- |
| `cw-context` | What Cadenway is, where the mockup, the integration guide and the repository map live, the product vocabulary (spaces, lists, sprints, tasks, statuses, milestones) and the multi-repository ownership rules. |
| `cw-contract-style` | Naming, pagination, error, id and date conventions shared by every Cadenway spec. |
| `cw-versioning-rules` | Which spec changes are minor or major, how deprecation works, and how events are versioned. |
| `cw-tech-asyncapi` | AsyncAPI contracts and event tooling. |
| `cw-tech-github-actions` | GitHub Actions workflows and CI configuration. |
| `cw-tech-openapi` | OpenAPI specifications and HTTP contracts. |
| `cw-tech-pnpm` | pnpm packages, scripts and workspaces. |
| `cw-tech-typescript` | TypeScript code and package boundaries. |

## Hooks

| Hook | When | What it refuses or does |
| --- | --- | --- |
| `guard.mjs` | before `Write`, `Edit` or `MultiEdit` | Sibling checkouts, generated trees, lockfiles, `.git/`, secrets and tokens, hand edits of generated packages, unpinned third-party actions and `pull_request_target` in workflows. |
| `guard-git.mjs` | before `Bash` or `PowerShell` | Pushes to `main`, tag pushes, force-pushes, rewrites of pushed commits, hook bypasses, destructive resets, registry publishing, branch names outside `<type>/<kebab>`. Adapted from the dentalstock guard. |
| `format.mjs` | after a successful `Write`, `Edit` or `MultiEdit` | Formats supported files with the repository's Prettier; a no-op until the formatter is installed. |
