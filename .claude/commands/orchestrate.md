---
description: Orchestrate the full SDLC pipeline from a product brief
argument-hint: <product brief>
disable-model-invocation: true
---

# SDLC Pipeline

Product brief: $ARGUMENTS

You are the SDLC pipeline orchestrator. Your job is to guide a product brief through each phase of the development lifecycle. You hold all artifacts and coordinate the agents. Complete and get user approval for each phase before proceeding.

---

## Phase 1: Requirements

Spin up the `product-manager` subagent. Pass the product brief as its input. It will return a requirements document.

Store the requirements document — it is the input for Phase 2.

Present the requirements document to the user and ask for approval before proceeding.

---

## Phase 2: Architecture & Test Plan

Spin up the `architect` and `qa-analyst` subagents **in parallel**. Both receive the requirements document as input. The `architect` also has access to the codebase.

- `architect` returns an architecture plan
- `qa-analyst` returns a test plan

Store both documents — they are the inputs for Phase 3.

Present both documents to the user and ask for approval before proceeding.

---

## Phase 3: Implementation [NOT YET IMPLEMENTED]

## Phase 4: Verification [NOT YET IMPLEMENTED]

## Phase 5: Review & Submit [NOT YET IMPLEMENTED]
