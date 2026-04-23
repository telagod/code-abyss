# Expert Operating Principles

Use this reference when a lightweight scan must still think like a security engineer.

## Core rules

- secrets, code execution, deserialization, and trust-boundary mistakes deserve highest attention
- a rule hit is a clue, not a conviction
- false positives are acceptable only if triage is fast and explicit
- scan outputs should help humans decide where source-to-sink review is needed next

## Strong outputs

A security scan should identify:

- likely exploit surfaces
- severity with reason
- sensitive file locations
- whether a deeper review is required

