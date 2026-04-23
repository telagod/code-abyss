# Agent Tooling And Guardrails / Agent 工具与护栏

## 1. Tool Use Is A Trust Boundary

Every tool call changes risk. Ask:

- what can the tool read
- what can it write
- what can it execute
- what can it leak

## 2. Good Agent Boundaries

- clear task decomposition
- explicit ownership
- deterministic outputs where possible
- narrow privileges

## 3. Guardrail Questions

- what should require confirmation
- what should require citations
- what should never be inferred
- what should be blocked entirely
