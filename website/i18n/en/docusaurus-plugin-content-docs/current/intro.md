---
sidebar_position: 1
title: Introduction
description: What this is — a pluggable desktop app template, one shell for all your little tools.
---

# What is this

**Electron + React + TypeScript desktop app template.** One sentence:

> One shell, for all your little tools.

- **Shell**: window, sidebar, routing, logging, packaging — ready out of the box.
- **Tools**: each feature is an independent module — one command to scaffold, config to toggle.

## Features

- **Pluggable features**: `pnpm feature:new <id>` scaffolds a feature package and wires it into the host; toggle on/off via `enabledFeatures`.
- **Built-in i18n**: zh-CN / en-US with runtime switching, namespaced copy.
- **Unified logging**: one logger across main + renderer, with a built-in log viewer.
- **Theming**: light / dark / system, driven by Tailwind v4 variables.
- **Testing**: Vitest unit tests + Playwright E2E.
- **One toolchain**: Biome handles both lint and format.
- **One-command release**: electron-builder three-platform packaging + GitHub Release + auto-update.

## Tech stack

Electron · React · TypeScript · Vite · TailwindCSS v4 · pnpm · Biome

## Who is it for

- Individuals or small teams who want a **desktop shell** and keep adding small tools to it;
- Anyone who wants windowing, routing, logging, i18n, and packaging to work out of the box.

## Next steps

- Want it running now? → [Quick start](./quickstart)
- Want to add your first tool? → [Feature development](./feature-development)
