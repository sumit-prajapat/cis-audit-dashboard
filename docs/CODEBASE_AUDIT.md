# CIS Audit Dashboard Codebase Audit

Date: 2026-05-26

## Executive Summary

The repository is an early-stage CIS audit dashboard with a React/Vite frontend, FastAPI backend, SQLAlchemy models, PostgreSQL target, PDF generation, Docker packaging, and a local Python scanner agent. The product direction is strong, but the implementation is not yet production-ready. The most urgent issue is backend contract drift: routes, schemas, models, PDF generation, and frontend screens disagree on model names and field names. Several core user flows are therefore broken or incomplete before enterprise features are added.

Recommended path: stabilize the current scan ingestion, auth, tenant boundaries, and API contracts first; then introduce modular architecture, migrations, RBAC, dashboards, and enterprise UX in controlled phases. Avoid a large rewrite until contracts are made explicit and covered by tests.

## Current Architecture

### Frontend

- React 18, Vite, TailwindCSS, Recharts, Axios, React Router.
- Routing lives in `frontend/src/App.jsx`.
- Shared API client lives in `frontend/src/api/index.js`.
- Main authenticated screens: `Dashboard`, `Devices`, `Scans`, `ScanDetail`, `Billing`, `Settings`.
- Login and registration screens are currently non-functional shells.
- State is local component state plus `localStorage` for token and user data.
- Styling is a mix of Tailwind classes, global CSS utility classes, inline styles, and emoji-based iconography.

### Backend

- FastAPI app in `backend/main.py`.
- SQLAlchemy synchronous engine/session in `backend/database.py`.
- ORM models in a single `backend/models.py`.
- Routes split by area: auth, scans, reports, organizations, billing.
- Auth uses bcrypt password hashing and HS256 JWT access tokens.
- PDF reporting uses ReportLab in `backend/pdf_generator.py`.
- Tables are created at app startup using `Base.metadata.create_all`.

### Agent

- `agent/scanner.py` detects OS, runs Windows or Linux checks, prints a summary, and posts results.
- Windows and Linux checks are imperative scripts under `agent/checks`.
- `agent/reporter.py` posts to a hardcoded HuggingFace Spaces URL.
- No enrollment token, organization binding, retry queue, signing, or offline sync exists.

### Database

Current models:

- `Organization`
- `User`
- `OrgMember`
- `OrgInvite`
- `Device`
- `Scan`
- `ScanCheck`

The schema is a useful start for multi-tenancy, but it lacks migrations, explicit unique constraints for memberships/devices, soft delete strategy, audit/activity tables, API keys, integrations, reports, notification tables, compliance frameworks, policies, remediations, and permission models.

## Critical Findings

### 1. Backend scan routes reference non-existent ORM objects and fields

`backend/routes/scans.py` imports `CheckResult`, but the model is named `ScanCheck`. It also writes `ip_address` and `owner_id` to `Device`, but those columns do not exist in `backend/models.py`. It orders by `Scan.scanned_at`, but the model uses `created_at`.

Impact: scan ingestion, scan listing, devices, reports, and PDF generation can fail at import time or runtime.

Fix first:

- Rename route references to `ScanCheck`.
- Add compatibility properties or response mapping for `created_at` as `scanned_at`.
- Either add `ip_address` to `Device` or remove it from agent/API contract.
- Replace `owner_id` with existing `user_id` or remove standalone ownership assumptions.

### 2. Pydantic schemas disagree with SQLAlchemy models

`backend/schemas.py` uses integer IDs and fields like `owner_id`, `scanned_at`, and `results`; the ORM uses UUID string IDs, `created_at`, and `checks`.

Impact: FastAPI response serialization will not match frontend expectations.

Fix first:

- Create explicit API response schemas using UUID strings.
- Use aliases or DTO mapping so API can expose stable `scanned_at` and `results` without renaming database columns immediately.
- Add scan/device contract tests.

### 3. Authentication is incomplete

`GET /auth/me` is a stub with `Depends(lambda: None)` and `pass`. Login/register pages in the frontend are placeholder shells, so the product cannot provide a complete auth journey.

Impact: protected UI relies on `localStorage`, but users cannot complete login/register through the current UI.

Fix first:

- Implement `/auth/me`.
- Build functional login/register forms.
- Add protected route wrapper that validates token state.

### 4. Tenant isolation is incomplete

Organizations exist, but scan submission is unauthenticated and devices are looked up globally by hostname. Scan/device listing endpoints do not filter by organization. Reports do not verify current user access.

Impact: data can leak across tenants and untrusted agents can pollute shared datasets.

Fix first:

- Require authenticated user or agent API key on ingestion.
- Scope all list/detail/report queries by `org_id`.
- Use unique constraints such as `(org_id, hostname)`.

### 5. Security posture is not production-grade

Observed risks:

- Default JWT secret fallback is `changeme-in-production-please`.
- JWT access token lifetime is seven days with no refresh token/session revocation.
- Tokens are stored in `localStorage`.
- No rate limiting, account lockout, 2FA, password policy beyond minimum length, CSRF strategy, security headers, audit logging, or centralized exception handling.
- CORS allows all methods and headers.
- Stripe webhook signature verification is skipped when secret is missing.
- Agent posts unauthenticated scan data to a hardcoded public API URL.

Fix first:

- Fail startup if production secrets are missing.
- Add refresh token/session table and shorter access token TTL.
- Add rate limiting for auth and ingestion endpoints.
- Add API-key based agent enrollment.
- Add audit logs for auth, org, scan, report, and billing events.

### 6. Database migrations are missing

`Base.metadata.create_all(bind=engine)` runs at startup. This is unsafe for production schema evolution and does not handle column changes, constraints, backfills, or rollbacks.

Fix first:

- Add Alembic.
- Create baseline migration from current models.
- Stop using `create_all` in production.

### 7. Frontend is visually promising but not enterprise-ready

The current UI has some dark SOC styling, gauges, trend charts, tables, and skeletons, but it is not yet a full enterprise console:

- Sidebar is static and emoji-based.
- No command palette.
- No workspace switcher.
- No dashboard segmentation by executive/security/compliance/assets/risk/reporting.
- No real theme system or light mode.
- Heavy inline styles reduce maintainability.
- No accessible focus strategy, aria patterns, or reduced-motion support.
- Mobile/tablet layouts are partial.
- Auth screens are placeholders.

Fix first:

- Introduce an app shell with typed navigation metadata, lucide icons, workspace selector, responsive top bar, command palette, and keyboard shortcut registry.
- Move styling into reusable components and design tokens.
- Build the requested dashboards from stable backend aggregate APIs.

### 8. Performance bottlenecks

- Device listing runs an N+1 query for last scan per device.
- Dashboard fetches all scans and all devices, then aggregates client-side.
- No pagination, filtering, sorting, or search APIs.
- No indexes beyond a few FK/index columns.
- Frontend bundle is large enough for Vite to warn after build.
- PDF generation is synchronous in request path.

Fix first:

- Add paginated scan/device endpoints.
- Add aggregate dashboard endpoints.
- Use subqueries/window functions for latest scan per device.
- Code-split frontend routes.
- Move heavy report generation to background jobs when reports become scheduled/branded.

## Area-by-Area Audit

### Frontend Architecture

Strengths:

- Simple route structure.
- Axios interceptor centralizes bearer token attachment.
- Useful existing components: score gauge, trend chart, check table, category breakdown, badges.
- Production build succeeds.

Gaps:

- No global auth/session provider.
- No query cache, request deduping, optimistic state, or error boundary.
- No component library layer.
- No dashboard-specific data service.
- Inconsistent styling patterns.
- Console logging leaks API configuration details.
- Build warns that `defs`, `linearGradient`, and `stop` are invalid Recharts imports in `TrendChart.jsx`; these are SVG elements and should not be imported from Recharts.

### Backend Architecture

Strengths:

- Routes are split by domain.
- Organization, member, invite, billing, scan, and report concepts exist.
- JWT dependency is reusable.
- Stripe integration has core lifecycle handlers.

Gaps:

- No service layer or repository layer.
- Route handlers mix validation, business logic, persistence, and third-party calls.
- No API versioning.
- No centralized error format.
- No request IDs or structured logging.
- No async DB support.
- No health/readiness checks beyond root route.
- No tests.

### Database Schema

Strengths:

- UUID primary keys.
- Basic organization membership model.
- Scan/check relationship is normalized.
- Device belongs to organization.

Gaps:

- No Alembic migrations.
- No roles/permissions tables.
- `User.role` duplicates `OrgMember.role`, which prevents true multi-org membership.
- Devices do not store IP address even though agent/frontend expect it.
- No framework/control catalog.
- No remediation lifecycle.
- No soft delete fields.
- No `updated_at` on several tables.
- No unique constraint for `(org_id, user_id)` memberships or `(org_id, hostname)` assets.
- No audit/event tables.

### API Design

Current endpoints are unversioned and partially inconsistent:

- `/auth/*`
- `/api/scans`
- `/api/devices`
- `/api/reports/{scan_id}/pdf`
- `/orgs/*`
- `/billing/*`

Needed:

- `/api/v1/auth/*`
- `/api/v1/orgs/*`
- `/api/v1/assets/*`
- `/api/v1/scans/*`
- `/api/v1/findings/*`
- `/api/v1/compliance/*`
- `/api/v1/reports/*`
- `/api/v1/notifications/*`
- `/api/v1/integrations/*`
- `/api/v1/audit-logs/*`

API responses should use consistent envelopes for paginated collections:

```json
{
  "items": [],
  "page": 1,
  "page_size": 50,
  "total": 0,
  "sort": "created_at:desc"
}
```

### Security Posture

Current maturity: prototype.

Priority controls:

- Secret validation at startup.
- Auth rate limiting.
- Strong password policy and breached-password checks.
- Refresh tokens with rotation and reuse detection.
- Session revocation.
- Agent API keys with hashed storage.
- Organization-scoped authorization dependencies.
- Fine-grained permission checks.
- Audit logs.
- Security headers.
- CORS allowlist by environment.
- Stripe webhook signature required outside local development.

### Product and UX

Current product is a scan dashboard. The target product is a cybersecurity compliance platform.

The new information architecture should include:

- Executive Dashboard
- Security Operations Dashboard
- Compliance Dashboard
- Asset Dashboard
- Risk Dashboard
- Reporting Dashboard
- Findings
- Remediations
- Frameworks
- Integrations
- Administration

Design principles:

- Dense, scan-friendly SOC layout.
- Clear severity hierarchy.
- Fast keyboard navigation.
- Multi-panel drilldowns.
- Persistent org/workspace context.
- Command palette for navigation and actions.
- Tables with search, filters, saved views, and export.
- Accessible color contrast and non-color severity indicators.

## Missing Enterprise Capabilities

- Multi-organization membership.
- Fine-grained RBAC.
- SSO/SAML/OIDC.
- 2FA/TOTP/WebAuthn.
- API keys and service accounts.
- Agent enrollment and inventory lifecycle.
- Scan scheduling and queues.
- Background jobs.
- Notification rules.
- Webhooks.
- Integrations with SIEM, ITSM, chat, and code platforms.
- Policy engine.
- Compliance framework catalog and cross-mapping.
- Evidence management.
- Remediation ownership and SLA tracking.
- Report scheduling.
- Custom branding.
- Data retention policies.
- Audit exports.
- Observability.
- CI/CD and environment promotion.

## Incremental Migration Roadmap

### Phase 0: Stabilize Contracts

Goal: make existing functionality work reliably without changing product scope.

1. Fix scan/report backend import and field drift.
2. Implement `/auth/me`.
3. Build functional login/register pages.
4. Add response DTOs for scans, checks, devices, user, and org.
5. Add basic tests for auth, scan ingestion, scan listing, scan detail, devices, and PDF route.
6. Remove frontend API debug logging.
7. Fix invalid Recharts imports.

Exit criteria:

- Frontend build succeeds without Recharts warnings.
- A user can register, login, submit a scan, view dashboard/devices/scans/detail, and download PDF.

### Phase 1: Tenant Safety and API Versioning

Goal: prevent cross-tenant leaks and create stable API boundaries.

1. Add `/api/v1`.
2. Scope all user-facing routes by organization.
3. Add agent API key model and authenticated ingestion.
4. Add membership uniqueness constraints.
5. Add organization-scoped device identity.
6. Add pagination/filter/sort primitives.
7. Add centralized exception handler and response envelope.

Exit criteria:

- Two organizations cannot see each other's scans, devices, reports, invites, or billing status.

### Phase 2: Database Migrations and Domain Model

Goal: replace prototype schema evolution with production schema management.

1. Add Alembic.
2. Baseline current schema.
3. Add missing fields: device IPs, asset metadata, updated timestamps, soft delete fields.
4. Add `roles`, `permissions`, and `role_permissions`.
5. Add `api_keys`, `audit_logs`, `activity_logs`.
6. Add `compliance_frameworks`, `controls`, `control_mappings`, `policies`, `remediations`.
7. Add indexes for dashboard and listing queries.

Exit criteria:

- Schema changes are migration-driven and reversible.

### Phase 3: Backend Modular Architecture

Goal: move business logic out of route handlers.

Target structure:

```text
backend/app/
  api/v1/routes/
  core/
  db/
  models/
  schemas/
  services/
  repositories/
  security/
  integrations/
  workers/
```

Implementation:

1. Introduce settings class using Pydantic settings.
2. Add service layer for auth, organizations, assets, scans, reports, billing.
3. Add repositories for data access.
4. Add dependency modules for current user, current org, permission checks.
5. Add structured logging and request IDs.
6. Add health/readiness endpoints.

Exit criteria:

- Route handlers only coordinate request/response, auth dependencies, and service calls.

### Phase 4: Enterprise App Shell and Design System

Goal: make the UI feel like an enterprise security console.

1. Build reusable layout primitives: app shell, sidebar, top bar, command palette, page header, metric card, panel, table, drawer, modal, tabs, filters.
2. Replace emoji icons with lucide icons.
3. Add workspace switcher.
4. Add keyboard shortcuts.
5. Add theme provider with dark/light modes.
6. Add route transitions and loading skeletons.
7. Add mobile/tablet responsive navigation.
8. Add accessibility patterns and focus states.

Exit criteria:

- All existing pages use the shared shell and components.

### Phase 5: New Dashboards and Visualization

Goal: create role-specific enterprise workflows.

Backend aggregate APIs:

- Executive posture summary.
- Compliance trend.
- Risk distribution.
- Asset health summary.
- Findings by severity/status/framework.
- Recent activity.

Frontend dashboards:

- Executive Dashboard.
- Security Operations Dashboard.
- Compliance Dashboard.
- Asset Dashboard.
- Risk Dashboard.
- Reporting Dashboard.

Visualizations:

- Compliance gauge.
- Trend charts.
- Severity analytics.
- Risk matrix.
- Heatmap.
- Radar chart.
- Audit timeline.
- Attack surface view.

Exit criteria:

- Dashboards load from backend aggregate endpoints rather than client-side full-table fetches.

### Phase 6: RBAC and Multi-Tenancy

Goal: support enterprise user governance.

Roles:

- Super Admin
- Organization Admin
- Security Analyst
- Auditor
- Viewer

Implementation:

1. Convert role checks to permissions.
2. Support users belonging to multiple organizations.
3. Add organization switching.
4. Add organization branding settings.
5. Add audit logs for permission-sensitive actions.

Exit criteria:

- Permissions are enforced centrally and tested.

### Phase 7: Scanning Engine

Goal: evolve from local script to managed scanning platform.

1. Add agent enrollment.
2. Add scan profiles and policies.
3. Add scan queue and scheduling.
4. Add offline result buffering.
5. Add retry/backoff.
6. Add plugin interface for OS/framework checks.
7. Add distro-specific Linux checks for Ubuntu, Debian, CentOS, RHEL.
8. Add signed result payloads or mTLS for high-assurance deployments.

Exit criteria:

- Agents can be enrolled, scoped to orgs, scheduled, and monitored.

### Phase 8: Compliance Frameworks and Remediation

Goal: move beyond raw CIS checks.

1. Create control catalog.
2. Map checks to CIS, NIST, ISO 27001, PCI DSS, SOC2, HIPAA.
3. Add framework comparison.
4. Add maturity scoring.
5. Add remediation owners, due dates, SLAs, statuses, comments.
6. Add evidence links and exportable compliance views.

Exit criteria:

- A failed technical check can map to multiple framework controls and produce remediation workflow.

### Phase 9: Reporting and Notifications

Goal: enterprise communication workflows.

1. Persist report definitions.
2. Add scheduled report jobs.
3. Generate PDF, CSV, and Excel.
4. Add branded report themes.
5. Add email, in-app notifications, and webhooks.
6. Add triggers for compliance drops, critical findings, scan failures, new assets, and policy violations.

Exit criteria:

- Reports and notifications can be configured per organization.

### Phase 10: Integrations, Observability, DevOps

Goal: production operations.

1. Add integration framework for Splunk, Elastic, Wazuh, Slack, Teams, Jira, ServiceNow, GitHub.
2. Add structured logs, metrics, and tracing.
3. Add Docker Compose for local and production-like environments.
4. Add GitHub Actions for lint, test, build, image publish, and deploy.
5. Add environment validation and deployment docs.
6. Add Sentry/OpenTelemetry-ready hooks.

Exit criteria:

- The platform can be built, tested, deployed, monitored, and operated with repeatable pipelines.

## Immediate Implementation Backlog

Priority order:

1. Fix backend model/schema/route drift for scans and reports.
2. Implement `/auth/me`.
3. Build production-quality login/register pages.
4. Add tenant scoping to scan/device/report endpoints.
5. Add DTO response mappers.
6. Add pytest coverage for critical API flows.
7. Add Alembic baseline.
8. Build the enterprise app shell.
9. Add command palette and workspace switcher.
10. Add aggregate dashboard endpoints and new dashboard routes.

## Verification Performed

- Read repository structure, backend models/routes/schemas/database/PDF generator, frontend pages/components/API client/styles, agent scanner/checks/reporter, Docker files, and README.
- Ran frontend production build via `npm.cmd run build`; build completed, with Recharts import warnings and bundle-size warning.
- Attempted Python compile validation; local shell failed to execute `python.exe` due to a Windows logon-session error, so backend import/runtime validation could not be completed in this environment.

