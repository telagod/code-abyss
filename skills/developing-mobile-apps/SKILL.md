---
name: developing-mobile-apps
description: Mobile development knowledge reference covering iOS (SwiftUI), Android (Jetpack Compose), React Native, and Flutter. Use when building mobile apps, working with cross-platform frameworks, or implementing native UI patterns.
user-invocable: false
---

# 移动开发域 · Mobile

```
原生：iOS(SwiftUI/UIKit) | Android(Compose/Kotlin)
跨平台：React Native(TS) | Flutter(Dart)
```

## iOS 检查项

SwiftUI 优先 | `@MainActor` 线程安全 | async/await | 依赖注入 | LazyVStack | Keychain 存敏感 | ViewModel 单测+Mock

## Android 检查项

Compose 优先 | StateFlow 替代 LiveData | Hilt 注入 | Room 持久化 | key 优化 LazyColumn | remember 防重组 | ViewModel 单测(runTest)

## 跨平台检查项

列表优化(FlatList/ListView.builder+key) | 状态管理(RTK/Riverpod) | 原生桥接验证 | 冷启动<1.5s | 渲染>55fps

## 选型

Web 背景→RN | 极致动画/UI 定制→Flutter | 大量原生交互→RN | 极致原生体验→原生

SwiftUI/Compose/RN/Flutter API 详情详见 [references/details.md](references/details.md)
