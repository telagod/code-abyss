---
name: developing-software
description: Software development knowledge reference covering Python, Go, Rust, TypeScript, Java, C++, and Shell. Use when writing code, debugging, or following language-specific best practices.
user-invocable: false
---

# 符箓秘典 · 开发语言

> **判断先于执行**：决定「是否做 / 选什么 / 如何取舍」（栈、方案、架构、权衡）前，先读领域判断内核 `skills/_kernel/backend/SKILL.md`——它管 judgment，本秘典管 execution；冲突时以内核判断为准。

## 路由

| 语言 | 秘典 | 核心场景 |
|------|------|----------|
| Python | [python](python.md) | FastAPI/Django、数据处理、自动化脚本 |
| Go | [go](go.md) | goroutine 并发、微服务、云原生工具 |
| Rust | [rust](rust.md) | 所有权系统、零成本抽象、系统编程 |
| TypeScript | [typescript](typescript.md) | Node 后端、React/Vue SPA、Next.js SSR |
| Java | [java](java.md) | Spring Boot、企业级、JVM 调优 |
| C/C++ | [cpp](cpp.md) | 内存管理、高性能计算、嵌入式 |
| Shell | [shell](shell.md) | Bash 脚本、系统管理、CI 胶水 |

## 选型决策

| 场景 | 首选 | 备选 | 判据 |
|------|------|------|------|
| Web 后端(快速) | Python(FastAPI) | Go(Gin) | 开发速度 vs 运行性能 |
| Web 后端(高并发) | Go(Gin/Echo) | Rust(Axum) | 生态成熟度 vs 极致性能 |
| Web 后端(企业) | Java(Spring Boot) | Go | 生态/团队 vs 部署简洁 |
| Web 前端 SPA | TypeScript+React | TypeScript+Vue | 生态规模 vs 上手速度 |
| SSR | Next.js | Nuxt.js | React 生态 vs Vue 生态 |
| 系统编程 | Rust | C/C++ | 内存安全 vs 生态/遗产 |
| CLI 工具 | Go | Rust | 编译速度 vs 运行性能 |
| 脚本/自动化 | Python | Bash | 跨平台 vs 系统原生 |
| 安全工具原型 | Python | Go/Rust | 快速迭代 vs 分发便利 |

## 通用模式

```
错误处理：Go(error返回) | Rust(Result<T,E>) | Python(try/except) | TS(try/catch)
并发：Go(goroutine+channel) | Rust(tokio) | Python(asyncio) | Java(虚拟线程)
依赖注入：Java(Spring) | Go(wire) | Python(dependency-injector) | TS(tsyringe)
测试：pytest | go test | cargo test | jest/vitest | JUnit
```
