---
schema-version: 2
name: mobile
title: 移动端知识域
description: 移动开发知识索引，覆盖 iOS、Android、React Native、Flutter、离线能力与交互约束。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [mobile, ios, android, react native, flutter, 移动开发]
negative-keywords: [纯后端存储]
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
aliases: []
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
