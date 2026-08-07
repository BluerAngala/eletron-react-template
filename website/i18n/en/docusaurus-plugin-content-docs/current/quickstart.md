---
sidebar_position: 2
title: Quick Start
description: "Up and running in five minutes: install, run, rename, add your first tool."
---

# Quick Start

## Requirements

- Node.js ≥ 20.19 or ≥ 22.12
- pnpm 11

## Install and run

```bash
# Clone (or use as a GitHub template)
git clone https://github.com/BluerAngala/eletron-react-template.git
cd eletron-react-template

# Install dependencies
pnpm install

# Start development mode
pnpm dev
```

## Create your own project from the template

```bash
# 1. Install dependencies
pnpm install

# 2. Rename (name / appId / repo / README in one pass; --dry-run to preview)
pnpm rename --name my-app --appId com.example.myapp --repo owner/repo

# 3. Replace resources/assets/logo.svg, then generate the full icon set
pnpm icons
```

## Add your first tool

```bash
pnpm feature:new json-tools   # scaffolds the feature package and wires it into the host
pnpm install                  # link the dependency (once, on creation)
pnpm dev                      # json-tools appears in the sidebar — start building
```

Then edit `packages/feature-json-tools/src/renderer.tsx` and replace the sample with your logic. See the [feature development guide](./feature-development).

## Common commands

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the app (dev mode) |
| `pnpm build` | Build renderer + package the app |
| `pnpm feature:new <id>` | Scaffold a new feature module |
| `pnpm feature:list` | List available feature modules |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` / `pnpm lint:fix` | Lint / auto-fix |
| `pnpm test` | Unit tests |
| `pnpm test:e2e` | End-to-end tests |
| `pnpm rename` | Rename the project |
| `pnpm icons` | Generate the full icon set from logo.svg |
