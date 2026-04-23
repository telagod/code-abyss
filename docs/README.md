# 文档索引

> 适用对象：所有维护者  
> 目标：让你知道“先看什么、什么时候看、看完要能做什么”

## 推荐阅读顺序

### 第一次接手仓库

1. [../README.md](../README.md)
2. [ONBOARDING.md](./ONBOARDING.md)
3. [../DESIGN.md](../DESIGN.md)

### 要改安装流程

1. [../DESIGN.md](../DESIGN.md)
2. [PACK_SYSTEM.md](./PACK_SYSTEM.md)
3. `test/install-smoke.test.js`

### 要新增或修改 skill

1. [ONBOARDING.md](./ONBOARDING.md)
2. [SKILL_AUTHORING.md](./SKILL_AUTHORING.md)
3. `personal-skill-system/skills/**/SKILL.md`

### 要新增或调整 pack

1. [PACK_SYSTEM.md](./PACK_SYSTEM.md)
2. [PACK_MANIFEST_SCHEMA.md](./PACK_MANIFEST_SCHEMA.md)
3. [PACKS_LOCK_SCHEMA.md](./PACKS_LOCK_SCHEMA.md)

## 文档地图

| 文档 | 回答的问题 | 适合谁 |
| --- | --- | --- |
| [ONBOARDING.md](./ONBOARDING.md) | 第一天要跑什么命令、看哪些目录 | 新接手者 |
| [PACK_SYSTEM.md](./PACK_SYSTEM.md) | pack 是怎么解析、同步、vendor、report 的 | 维护安装和扩展的人 |
| [PACK_MANIFEST_SCHEMA.md](./PACK_MANIFEST_SCHEMA.md) | pack manifest 应该怎么写 | 新增第三方 pack 的人 |
| [PACKS_LOCK_SCHEMA.md](./PACKS_LOCK_SCHEMA.md) | 项目级 pack 启用策略怎么声明 | 维护仓库级 pack 策略的人 |
| [SKILL_AUTHORING.md](./SKILL_AUTHORING.md) | `SKILL.md` frontmatter 与脚本规则是什么 | 维护 skill 的人 |

## 根目录文档如何分工

| 文档 | 作用 |
| --- | --- |
| [../README.md](../README.md) | 项目入口、安装方法、开发命令、文档地图 |
| [../CLAUDE.md](../CLAUDE.md) | 给 repo-aware agent 与维护者的操作准则 |
| [../DESIGN.md](../DESIGN.md) | 系统分层、关键设计与边界 |

## 维护规范

- 每篇文档都应该明确“适用对象”和“解决的问题”。
- 不要在文档里手写容易漂移的数量统计。
- 文档中的路径、命令、生成物必须能在源码或测试里找到依据。
- 如果新增一份文档，优先把它挂到本索引里，而不是让它孤立存在。

## 读完后的最低标准

如果你读完这份索引和 onboarding，仍然不知道：

- 先跑什么命令
- 改动该看哪几个目录
- 哪些测试是你的回归护栏

那说明文档体系还没整理到位，应继续补。
