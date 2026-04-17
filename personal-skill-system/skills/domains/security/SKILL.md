---
schema-version: 2
name: security
title: 安全知识域
description: 攻防安全知识索引，覆盖审计、漏洞思路、信任边界、输入处理与风险评估。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [安全, 审计, 漏洞, injection, xss, ssrf, secrets]
negative-keywords: [纯视觉设计]
priority: 82
runtime: knowledge
executor: none
permissions: [Read, Grep, Bash]
risk-level: high
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [domain, security]
aliases: [sec]
---

# Security Domain

## Use This When

- the task touches trust boundaries
- the task handles user input, command execution, auth, tokens, or secrets
- the user explicitly asks for audit, exploitability, or hardening

## Quick Judgement

- source -> sink reasoning
- authn/authz separation
- secrets hygiene
- input validation and output encoding
- safe defaults and least privilege

## Read These References

- `references/trust-boundaries-and-audit.md`
  Read when reviewing source-to-sink paths, entry points, or attack surfaces.
- `references/common-vulnerability-patterns.md`
  Read when the task touches injection, deserialization, path traversal, SSRF, or XSS-like bug classes.
- `references/auth-secrets-and-hardening.md`
  Read when the issue involves identity, permission boundaries, token handling, or operational hardening.

## Route onward

- explicit scan -> `verify-security`
- fix a confirmed issue -> `bugfix`
- design secure boundaries -> `architecture-decision`
