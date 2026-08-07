# ADR-002: Group Host Sources by Responsibility

## Status

Accepted

## Date

2026-08-07

## Context

The repository root previously contained separate renderer, Electron, shared configuration, assets, public files, scripts, and tests directories. This made the template root difficult to scan as optional workspace feature packages were added.

## Decision

The host application is grouped by responsibility:

- `app/renderer` contains the React renderer, routes, i18n, and host feature loading entries.
- `app/electron` contains Electron main-process, preload, and Electron-only shared files.
- `app/shared` contains host configuration shared across processes.
- `resources/assets` contains editable source artwork and `resources/public` contains Vite static assets.
- `scripts/` contains maintenance and feature-management scripts.
- `tests` contains unit, end-to-end, and browser automation tests.

Root-level configuration remains at the root because pnpm, Vite, TypeScript, Playwright, Electron Builder, and CI discover those files there. Generated output directories (`build`, `dist`, `dist-electron`, and `release`) remain root-level and ignored or managed as build artifacts.

## Consequences

- The root contains fewer source directories and separates host code from reusable workspace packages.
- New host code must be placed under `app/`, not at the repository root.
- Tool configuration and documentation must use the new paths when referring to host source, resources, scripts, or tests.