# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-08

### Added
- `Client` class — zero-dependency API client built on native `fetch`, compatible with Node.js 18+, Deno, and Bun
- Resource classes for all ScanLyser API endpoints: `Teams`, `Sites`, `Scans`, `Pages`, `Issues`, and `Reports`
- Full TypeScript types for all API request and response shapes
- Automatic retry on HTTP 429 (rate limiting) with `Retry-After` header support
- Typed error classes for all API error codes: `AuthenticationError` (401), `AuthorizationError` (403), `NotFoundError` (404), `ValidationError` (422), and `RateLimitError` (429)
- `ScanlyserError` base class for consistent error handling across all error types
- Webhook signature verification via `WebhookVerifier` using the Web Crypto API (`crypto.subtle`) — works in all modern runtimes
- `awaitCompletion()` helper on the `Scans` resource for polling scan status with configurable timeout and interval
- ESM-only package with full TypeScript declaration files included in the distribution
