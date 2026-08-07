# 文档地图

> 这个模板的文档体系。忘了哪个文档是干嘛的？回来看这张表。

## 顶层文档

| 文档 | 用途 |
|------|------|
| [../README.md](../README.md) | 项目入口：特性、快速开始、可选功能、发布 |
| [../AGENTS.md](../AGENTS.md) | 仓库指南（给开发者 / AI）：约定、目录、质量检查 |
| [project-standards.md](./project-standards.md) | **项目总纲**：每个项目标配、跨端架构、质量要求 |
| [feature-development.md](./feature-development.md) | **开发手册**：往壳里加小工具的步骤（建模块 / 写页面 / 开关） |
| [logging-standard.md](./logging-standard.md) | 日志规范：统一 logger 用法 |
| [decisions/](./decisions/) | 架构决策记录（ADR） |

## 架构决策（docs/decisions/）

| 文档 | 决策 |
|------|------|
| 001-workspace-feature-packages.md | 功能包化（可插拔模块） |
| 002-host-directory-layout.md | 宿主目录布局 |
| 003-feature-config-switch.md | 配置驱动开关 |
| 004-cross-platform-architecture.md | 壳–核心分离（跨端架构） |

## 目录级说明（每个关键目录自带 README）

| 目录 | 说明文档 | 一句话 |
|------|---------|--------|
| ../app | [app/README.md](../app/README.md) | 宿主源码（壳） |
| ../packages | [packages/README.md](../packages/README.md) | 可插拔功能包 |
| ../scripts | [scripts/README.md](../scripts/README.md) | 维护脚本 |
| ../tests | [tests/README.md](../tests/README.md) | 测试 |
| ../website | [website/README.md](../website/README.md) | 文档网站 |
| ../resources | [resources/README.md](../resources/README.md) | 资源 |

## 规范

- 新增功能：见 [feature-development.md](./feature-development.md)，用 `pnpm feature:new <id>`。
- 新增关键目录：**必须**带一个 README（5 行内说清用途 + 指向相关文档）。
