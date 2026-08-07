# ADR-003: Configuration-Driven Feature Toggle

## Status

Accepted

## Date

2026-08-07

## Context

ADR-001 introduced workspace feature packages, but toggling required commands (`pnpm feature:add|remove`) that rewrote host loading entries and managed host dependencies, plus a `pnpm install`. For a template aimed at beginners, switching a feature should be pure configuration.

## Decision

Feature toggling is configuration-driven, not command-driven:

- `app/shared/features.ts` exports `enabledFeatures` — the single switch. Keep an id to enable, remove it to disable.
- The host keeps one thin registry per process (`app/renderer/features/renderer.ts`, `app/renderer/features/i18n.ts`, `app/electron/main/features.ts`, `app/electron/preload/features.ts`), each mapping a feature id to its loader (`createXxxFeature` from the feature package). Only ids present in `enabledFeatures` are assembled.
- Feature packages stay as workspace dependencies in the root `package.json`; disabling a feature no longer removes its dependency — it simply does not register routes, IPC, or the preload bridge at runtime.
- `scripts/feature.mjs` only lists available modules (auto-discovered from `packages/feature-*`); `pnpm feature:add|remove` are removed.
- A minimal sample package `packages/feature-example` documents the shape of a feature (renderer / main / preload / locales + contract).

## Consequences

- Toggling a feature is now: edit `enabledFeatures` → restart `pnpm dev`. No commands, no `pnpm install`.
- Feature packages remain installed even when disabled; the host build still includes their modules but never activates them. This trades the "excluded from build" guarantee of ADR-001 for a much simpler beginner experience.
- Feature navigation labels now ship inside the feature package (`ns` on navigation items) instead of the host's `common.json`.
- New features need one loader line per registry; `packages/feature-example` is the reference scaffold.
