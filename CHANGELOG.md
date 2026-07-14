# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Typed scan assessment outcome, coverage, score eligibility, and page assessment outcome/cause data
- `hasUsableScore()` for guarding score presentation against incomplete evidence
- Distinct public `ScanCategory` type and optional scan-category selection in `ScanResource.trigger()`
- Requested-category, category-coverage, and scored-category-scope response types
- `hasUsableCategoryScore()` for guarding category score presentation against missing or incomplete evidence
- Distinct `ScanPageStatus` lifecycle type, including the API's `evaluating` state
- Typed v2 exact-occurrence result envelopes, runtime validation, and result hydration for issue/page resources
- `typecheck` package script and byte-identical canonical result-contract fixture coverage
- Discriminated `Finding` and `Diagnostic` resources with finding-only issue hydration
- Separate paginated diagnostics client and page diagnostic collections/counts
- Customer-safe `{ code, message, correlation_id }` scan/page lifecycle failures
- Canonical diagnostic-envelope fixture coverage and finding/diagnostic serialization checks

### Fixed
- Treat cancelled scans as terminal in `awaitCompletion()`
- Preserve nullable category scores instead of requiring unassessed categories to be numeric

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
