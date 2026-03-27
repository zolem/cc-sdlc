# cc-sdlc

A Claude Code / Cursor SDLC pipeline that takes a product brief and fully implements it — requirements, architecture, task planning, implementation, verification, and a handoff summary — with no manual intervention.

## Install

### Claude Code

```bash
npx cc-sdlc
```

Installs the `/orchestrate` skill and all agents into `~/.claude`.

```bash
npx cc-sdlc --force                          # overwrite existing files
npx cc-sdlc --claude-dir /path/to/.claude    # custom directory
```

### Cursor

```bash
npx cc-sdlc --cursor
```

Installs the `/orchestrate` skill and all agents into `~/.cursor`.

```bash
npx cc-sdlc --cursor --force                         # overwrite existing files
npx cc-sdlc --cursor-dir /path/to/.cursor            # custom directory
```

### Both at once

```bash
npx cc-sdlc --claude --cursor
```

## Usage

Open Claude Code or Cursor in any repository and run:

```
/orchestrate <your product brief>
```

**Example:**

```
/orchestrate Build a URL shortener where users paste a long URL and get a short
link. Clicking the short link redirects to the original. Track click counts.
No user accounts required.
```

The pipeline runs fully automated from there.

## What it does

```
Phase 1  Requirements      Product brief → user stories, personas, acceptance criteria
Phase 2  Architecture      Requirements + codebase → implementation plan + test cases (parallel)
Phase 3  Task Planning     All docs → ordered, executable task files with dependency graph
Phase 4  Implementation    Parallel engineer agents per phase, each in an isolated git worktree
Phase 5  Verification      QA + security + accessibility + browser testing in parallel, auto-fix loop (up to 3x)
Phase 6  Handoff           Summary of everything built, decisions made, and suggested next steps
```

### Agents

| Agent                    | Role                                                                                                              |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `product-manager`        | Transforms a brief into a structured requirements doc with user stories and acceptance criteria                   |
| `architect`              | Reads the codebase and requirements, produces a concrete implementation plan                                      |
| `qa-analyst`             | Maps every user story to executable test cases covering happy paths, edge cases, and failures                     |
| `task-planner`           | Decomposes planning docs into ordered, parallel-executable vertical slice tasks                                   |
| `engineer`               | Implements a single task — code, tests, verification — in an isolated git worktree                                |
| `qa-verifier`            | Runs the test suite and checks every test case from the plan is implemented                                       |
| `security-reviewer`      | Reviews changed code for OWASP Top 10 and common vulnerabilities                                                  |
| `manual-tester`          | Starts the app and walks through user stories in a real browser _(optional, requires Claude in Chrome extension)_ |
| `merge-resolver`         | Resolves git merge conflicts by understanding the intent of both conflicting tasks                                 |

### Output

All pipeline artifacts are written to `docs/{feature-slug}/`:

```
docs/{feature-slug}/
  requirements.md       — user stories and acceptance criteria
  architecture.md       — implementation plan and component design
  test-plan.md          — full test case specification
  task-index.md         — execution phases and dependency graph
  tasks/
    task-001.md         — individual task specs for engineer agents
    task-002.md
    ...
  verification/
    qa-report.md        — test suite results and coverage
    security-report.md  — security findings by severity
    accessibility-report.md — a11y findings by severity
    manual-test-report.md  — browser-based exploratory test results (if Chrome extension enabled)
```

## Requirements

- [Claude Code](https://claude.ai/code) or [Cursor](https://cursor.com) installed and authenticated
- Node.js 18+
- A git repository with a remote configured (required for worktree isolation during implementation — run `git remote add origin <url>` before using `/orchestrate`)
  - There is a bug in Claude Code where worktrees only work if you have a remote set. Until that is fixed, this is required for parallel engineer execution. The orchestrator will still work without it — it will detect that worktrees are unavailable and run engineers sequentially.

## Optional: Browser Testing

The `manual-tester` agent walks through user stories in a real browser using Claude's built-in Chrome integration. To enable it:

1. Install the **[Claude in Chrome extension](https://chromewebstore.google.com/detail/claude-in-chrome)** in Chrome or Edge (v1.0.36+)
2. Launch Claude Code with Chrome integration enabled: `claude --chrome`

The pipeline works without this — the `manual-tester` is skipped if the extension is not available. All other verification (QA, security, accessibility) runs regardless.

## Contributing

Source files live in `src/` — edit agents in `src/agents/` and skills in `src/skills/`. Each source file uses combined frontmatter with `claude:` and `cursor:` subsections for tool-specific fields. After editing, run the build to regenerate the `.claude/` and `.cursor/` output directories:

```bash
npm run build
```
