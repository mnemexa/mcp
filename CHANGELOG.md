# Changelog

All notable changes to `@mnemexa/mcp` are documented here. This project follows [Semantic Versioning](https://semver.org/).

## [2.0.3] — 2026-05-15

### Changed
- `brain.status` now calls the new public `GET /v1/status` endpoint and returns the real workspace name, status, plan, billing cycle, and API-key prefix. Previously it returned a hardcoded "connected" message that didn't verify anything against the backend. Non-active workspaces (suspended, limit_reached) now surface that state explicitly so users can self-diagnose. If the API key is configured locally but rejected by the backend, the failure is reported clearly instead of falsely claiming "connected".

## [2.0.2] — 2026-05-15

### Fixed
- `brain.remember` now sends `{ text }` in the request body (was `{ content }`), matching the backend `POST /v1/memory/store` contract. Previously every `remember` call returned 422.
- `brain.health` now works end-to-end against the newly-shipped public `GET /v1/optimize/health` endpoint. Previously returned 404.

### Removed
- `brain.answer` tool removed. The underlying `/v1/memory/reason` endpoint is out of scope. Use `brain.recall` to retrieve memories; synthesis is the calling model's responsibility.

### Changed
- Brand positioning updated everywhere: Mnemexa is now described as **the Intelligent Memory OS for AI**.

## [2.0.1] — 2026-05-10

### Changed
- Rebrand: package renamed from `@bizxengine/mcp` to `@mnemexa/mcp`. API key prefix updated from `bxk_` to `mnx_`. Backward compatibility maintained via `BIZX_API_KEY` env var fallback and `~/.bizxengine/config.json` fallback.

## [1.2.0] — earlier

- Final release under the legacy `@bizxengine/mcp` name. Left undeprecated on npm as a silent backward-compat path; the legacy `api.bizxengine.com` host 301-redirects to `api.mnemexa.com`.
