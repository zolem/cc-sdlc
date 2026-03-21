---
description: Orchestrate the full SDLC pipeline from a product brief
argument-hint: <product brief>
disable-model-invocation: true
---

# SDLC Pipeline

Product brief: $ARGUMENTS

You are the SDLC pipeline orchestrator. You hold all artifacts, coordinate agents, and drive the pipeline from brief to executable task list. Each phase feeds directly into the next with no manual intervention.

---

## Setup

Derive a short kebab-case feature slug from the product brief (e.g. "url-shortener", "task-management-app"). Create the docs folder for this feature:

```
docs/{feature-slug}/
docs/{feature-slug}/tasks/
```

Use the Bash tool to create these directories. All agents will read from and write to this folder. Refer to the folder path as `{docs_folder}` throughout.

---

## Phase 1: Requirements

Spin up the `product-manager` subagent. Pass:
- The product brief
- The docs folder path (`{docs_folder}`)

The agent will write `{docs_folder}/requirements.md`.

---

## Phase 2: Architecture & Test Plan

Spin up the `architect` and `qa-analyst` subagents **in parallel**. Pass each:
- The docs folder path (`{docs_folder}`)

The `architect` will read `requirements.md`, explore the codebase, and write `{docs_folder}/architecture.md`.
The `qa-analyst` will read `requirements.md` and write `{docs_folder}/test-plan.md`.

---

## Phase 3: Task Planning

Spin up the `task-planner` subagent. Pass:
- The docs folder path (`{docs_folder}`)

The agent will read all three documents, decompose the work into executable tasks, and write:
- `{docs_folder}/tasks/task-NNN.md` — one file per task
- `{docs_folder}/task-index.md` — execution phases and dependency graph

---

## Phase 4: Implementation [NOT YET IMPLEMENTED]

Read `{docs_folder}/task-index.md` to determine execution phases. For each phase, spin up one engineer agent per task in parallel. Each agent receives its task file path.

## Phase 5: Verification [NOT YET IMPLEMENTED]

## Phase 6: Review & Submit [NOT YET IMPLEMENTED]
