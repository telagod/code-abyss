---
schema-version: 2
name: mobile
title: Mobile Domain
description: Mobile application design and implementation constraints: iOS, Android, React Native, Flutter, lifecycle, offline behavior, and permissions. Use when the task is clearly mobile-specific.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ios, android, react native, flutter, mobile, 移动端, iOS开发, Android开发, 跨平台移动, mobile app, 移动开发]
priority: 67
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, mobile]
aliases: [mobile-dev, 移动开发]
---

# Mobile Domain

## Use This When

- the task is app-side architecture, UX constraints, or platform-specific behavior
- the user asks about iOS, Android, RN, Flutter, or offline/mobile-first flows

## Quick Judgement

- lifecycle and state
- network and offline boundaries
- platform conventions
- touch, performance, battery, and permission surfaces

## Read These References

- `references/app-lifecycle-and-state.md`
  Read when the task touches app state, navigation, lifecycle, or background/foreground transitions.
- `references/offline-network-and-permissions.md`
  Read when the issue is offline behavior, sync, flaky networks, device permissions, or battery constraints.
- `references/expert-operating-principles.md`
  Read when the mobile task needs stronger lifecycle, offline, battery, permission, or platform-convention judgement.
