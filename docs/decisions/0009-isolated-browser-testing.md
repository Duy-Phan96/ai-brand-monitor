# ADR 0009 — Isolated deterministic browser tests

## Problem
Verify the actual MVP workflow without touching the developer's data or consuming live Gemini quota, including when the local .env opts into Gemini.

## Alternatives
Entirely mocked browser API responses would miss persistence/import/export behavior. Reusing the developer's running backend risks credentials and data. A dedicated test wrapper with temporary storage and deterministic AI was selected; mocks are limited to deliberate loading/error scenarios.

## Decision and implementation
Playwright manages dedicated frontend/backend servers, refuses reuse, runs serially and resets only a temporary DB through a test-wrapper-only endpoint. The wrapper disables dotenv and clears credentials before app imports. Real outbound backend HTTP and non-loopback sockets are rejected. Browser origin and WebSocket guards abort unexpected destinations; service workers are blocked. Vite's proxy target is configurable for tests while its normal default remains unchanged. Windows asyncio loopback IPC is permitted.

## Trade-offs
Serial execution is slower but makes shared temporary DB reset predictable. At the original milestone the launch path was Windows-only. Release preparation now selects a local Windows/Linux virtualenv interpreter or PATH Python for CI without changing isolation. Guards are test policy, not an OS sandbox. Chromium mobile emulation is not evidence for Safari, Firefox, real devices or full accessibility. A lockfile freezes frontend resolutions but does not resolve existing advisories.

## Verification and explanation
Eight desktop/mobile E2E tests passed; 39 backend and 8 frontend unit tests passed, production build passed. Explain real persistence and downloaded exports separately from deliberate error mocks and separate live Gemini evidence. No automated test uses a live provider. Detailed findings: ../testing/BROWSER_E2E_RESULTS.md.
