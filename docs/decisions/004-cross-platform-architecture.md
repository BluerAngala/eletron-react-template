# ADR-004: Shell–Core Separation for Cross-Platform

## Status

Accepted

## Date

2026-08-07

## Context

The template currently ships a desktop (Electron) shell and a Docusaurus docs site. The project owner plans to add a web build and a mini-program build later. Without a deliberate boundary, platform-specific code (Electron IPC, browser APIs, mini-program APIs) would leak into shared logic and force a rewrite per platform.

## Decision

Adopt a **shell–core separation**:

- **Core (platform-agnostic)**: `app/shared`, `packages/feature-*/src/shared` — pure logic, state, and data protocols. Must not import platform APIs.
- **Shared UI**: `app/renderer` (React) is reused by the desktop and web shells.
- **Shells (one per platform)**: `app/electron` (desktop, done), `app/web` (planned), `app/mini` (planned). Platform APIs only live in a shell.
- **Capability abstraction**: storage / clipboard / open-external / notifications / files are declared as interfaces and implemented per platform. Core code depends only on the interfaces.
- **Features extend cross-platform**: a feature package gains per-platform adapters (`src/web`, `src/mini`) while `src/shared` and `src/renderer` are reused unchanged.

## Consequences

- Adding a platform becomes "add a shell + per-platform capability implementations", not a rewrite.
- Core logic stays testable and platform-independent.
- Desktop-only capabilities (IPC, filesystem, native dialogs) need a degrade-or-hide strategy in other shells.
- Every project from this template ships a desktop app + a docs site by default; web and mini shells are opt-in extensions.
