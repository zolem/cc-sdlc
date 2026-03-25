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

## Phase 4: Implementation

Read `{docs_folder}/task-index.md` to get the execution phases and task list.

Execute phases in order. **Do not start a phase until all tasks in the previous phase are complete and merged.**

For each phase:
1. Spin up one `engineer` subagent per task in the phase, **all in parallel**, each with `isolation: "worktree"` so agents work in isolated git branches and cannot conflict with each other
2. Pass each agent the path to its task file: `{docs_folder}/tasks/task-NNN.md`
3. Wait for all agents in the phase to respond
4. Check each response:
   - If any agent reports **blocked**: stop the pipeline, surface the blocker to the user
   - If all agents report **complete**: proceed to merge
5. **Merge phase**: for each worktree branch returned by a completed agent, merge it into the current branch using the Bash tool (`git merge {branch}`). Merge branches one at a time. If a merge conflict occurs: surface it to the user and stop — do not attempt to auto-resolve.
6. After all branches for the phase are cleanly merged, proceed to the next phase

After all phases are complete, report a summary to the user: tasks completed, files changed, any notes from engineer agents.

## Phase 5: Verification & Fix Loop

This phase loops until all verification checks pass or the iteration limit is reached.

**Maximum iterations: 3.** If verification is still failing after 3 fix cycles, stop and surface all remaining issues to the user — do not continue looping.

### Step 1: Verify

Create `{docs_folder}/verification/` if it does not exist.

Spin up the verification agents **in parallel**, passing each the docs folder path (`{docs_folder}`):

- `qa-verifier` — runs the test suite and checks test plan coverage, writes `{docs_folder}/verification/qa-report.md`
- `security-reviewer` — reviews changed code for vulnerabilities, writes `{docs_folder}/verification/security-report.md`
- `accessibility-reviewer` — reviews UI code for a11y issues, writes `{docs_folder}/verification/accessibility-report.md`
- `manual-tester` — starts the app and walks through user stories in a real browser using Claude's built-in Chrome integration, writes `{docs_folder}/verification/manual-test-report.md` *(requires the Claude in Chrome extension — skip this agent if not available)*

Wait for all agents to complete. Read each report and check the **Result** line.

- If all reports are **PASS**: exit the loop and proceed to Phase 6.
- If any report is **FAIL** and the iteration limit has not been reached: proceed to Step 2.
- If any report is **FAIL** and the iteration limit has been reached: stop, surface all remaining failures to the user, and halt the pipeline.

### Step 2: Plan Fixes

Spin up the `task-planner` subagent in fix mode. Pass:
- The docs folder path (`{docs_folder}`)
- The failed verification reports

The task planner will read the findings, create fix task files, and append new phases to `{docs_folder}/task-index.md`.

### Step 3: Implement Fixes

Execute the newly appended phases from `task-index.md` using the same parallel engineer agent logic as Phase 4 (worktree isolation, one engineer per task, merge after each phase).

Once all fix tasks are complete, return to Step 1 for the next verification run.

---

## Phase 6: Summary & Handoff

Read all artifacts produced during the pipeline and present the user with a single comprehensive summary. The goal is to give them everything they need to understand what changed and make an informed decision about next steps — without having to read any individual doc themselves.

Present the summary directly in the conversation using this structure:

---

**## [Feature Name] — Implementation Summary**

**### What Was Built**
A plain-language description of the feature as implemented, tied back to the original brief. Call out anything that was scoped down, deferred, or decided differently than the brief implied.

**### Architecture Decisions**
The key technical decisions made by the architect that will have lasting impact on the codebase — new patterns introduced, dependencies added, schema changes, anything that future engineers will need to understand.

**### Files Changed**
A grouped summary of all files created or modified across all tasks. Group by area (e.g. data layer, API, UI, tests) rather than listing every file flat.

**### Verification Results**
- QA: [pass/fail summary, test count, coverage]
- Security: [pass/fail, any Medium findings worth knowing even if not blocking]
- Accessibility: [pass/fail, any Medium findings worth knowing even if not blocking]

**### Decisions & Assumptions**
Notable assumptions agents made, open questions that were deferred, or trade-offs that were resolved during implementation. These are things the user may want to revisit.

**### Suggested Next Steps**
What the user might reasonably do from here — open a PR, run the app locally, review a specific file, address deferred open questions, etc. Offer options, not instructions.
