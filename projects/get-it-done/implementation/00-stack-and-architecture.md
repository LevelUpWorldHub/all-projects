# Get It Done Implementation Plan: Stack and Architecture

## Implementation Goal

Turn the RFQ/Bid/change-order command center into an implementation-ready plan for a Next.js, TypeScript, PostgreSQL, and Drizzle ORM application.

First operating unit:

```text
Project setup → RFQ creation → Vendor invite → Vendor RFQ view → Bid submission → Bid comparison → Award → Change order → Approval + audit trail
```

## Stack Assumptions

| Layer | Choice | Notes |
|---|---|---|
| Web framework | Next.js App Router | Server components for read-heavy pages, server actions or route handlers for mutations |
| Language | TypeScript | Strict mode |
| Database | PostgreSQL | Primary transactional store |
| ORM | Drizzle ORM | Schema-first TypeScript modeling |
| Auth | Session-based auth with role/project permissions | Can be NextAuth/Auth.js, Clerk, custom, or Supabase Auth behind helpers |
| File storage | S3-compatible object storage | AWS S3, Cloudflare R2, or Supabase Storage |
| Email/invites | Transactional email provider | Resend, Postmark, SendGrid, or AWS SES |
| Background jobs | Optional queue later | For email retry, notifications, exports |
| Validation | Zod | Shared input schemas for route handlers/server actions |
| Testing | Vitest + Playwright | Unit tests for guards, integration tests for services, E2E for workflow |

## Architecture Principles

1. **Status-driven workflow**
   - RFQ, Bid, and Change Order state must be explicit.
   - Never infer commercial state only from timestamps or notes.

2. **Service-layer mutations**
   - API routes/server actions should call domain services.
   - Domain services enforce permissions, status guards, validation, and audit events.

3. **Append-only audit events**
   - Every major commercial action creates an immutable audit event.
   - Do not edit/delete audit events through application code.

4. **Permission-first access**
   - Internal access flows through organization/project membership.
   - Vendor access flows through scoped invite/session/token.
   - Owner approval access is scoped to relevant project/change order.

5. **Transactional integrity**
   - State mutation and audit event creation should happen in the same database transaction.
   - Awarding a bid and marking other bids as not selected must be one transaction.

6. **Files are references, not truth**
   - Store files in object storage.
   - Store metadata and entity ownership in Postgres.
   - Never trust a file URL alone for authorization.

## Recommended Directory Layout

```text
src/
  app/
    (app)/
      projects/
        page.tsx
        [projectId]/
          page.tsx
          rfqs/
            page.tsx
            new/page.tsx
            [rfqId]/
              page.tsx
              compare/page.tsx
              award/page.tsx
          change-orders/
            page.tsx
            [changeOrderId]/page.tsx
    vendor/
      rfq/
        [inviteToken]/
          page.tsx
          submit/page.tsx
    api/
      projects/route.ts
      vendors/route.ts
      rfqs/route.ts
      rfqs/[rfqId]/send/route.ts
      rfqs/[rfqId]/compare/route.ts
      bids/route.ts
      bids/[bidId]/withdraw/route.ts
      awards/route.ts
      change-orders/route.ts
      change-orders/[changeOrderId]/submit/route.ts
      change-orders/[changeOrderId]/approve/route.ts
      files/presign/route.ts
  db/
    index.ts
    schema/
      audit.ts
      bids.ts
      change-orders.ts
      organizations.ts
      projects.ts
      rfqs.ts
      users.ts
      vendors.ts
      index.ts
  lib/
    auth/
      session.ts
      permissions.ts
      vendor-access.ts
    domain/
      rfq-status.ts
      bid-status.ts
      change-order-status.ts
      guards.ts
    services/
      audit.service.ts
      project.service.ts
      vendor.service.ts
      rfq.service.ts
      bid.service.ts
      award.service.ts
      change-order.service.ts
      file.service.ts
      email.service.ts
    validation/
      rfq.schemas.ts
      bid.schemas.ts
      change-order.schemas.ts
      vendor.schemas.ts
    utils/
      money.ts
      ids.ts
```

## Domain Modules

| Module | Owns | Must enforce |
|---|---|---|
| Project | projects, project members | project access and roles |
| Vendor | vendor directory | organization boundary |
| RFQ | RFQ creation, send, view, close | status transitions, invite rules |
| Bid | bid submission, revision, withdrawal | vendor access, due date, immutability |
| Award | award decision | one active award, bid status updates |
| Change Order | CO creation/submission/approval | approval permissions, status transitions |
| Audit | audit events | append-only events |
| Files | file metadata and signed URLs | entity-level access |
| Email | invite and notification delivery | idempotency and retry later |

## Auth Model

### Internal users

Internal users authenticate through the main app session.

Authorization checks should include:

1. User belongs to organization.
2. User has project membership for project-scoped data.
3. User role or project role permits action.

### Vendor users

For v1, use scoped invite access.

Recommended:

- Invite token is generated once.
- Store token hash, not raw token.
- Token expires or can be revoked.
- Token is scoped to one `rfq_invite`.
- Vendor can only view that RFQ and submit/update their own bid.

Full vendor accounts can be added later.

### Owner approvers

For v1, owner approval can use either:

- Internal owner-rep account with project membership.
- Scoped approval token for a specific change order.

Use internal accounts first if the app already has auth. Use approval token if owner onboarding friction must be low.

## File Storage Model

Use S3-compatible storage.

Recommended bucket structure:

```text
organizations/{organizationId}/projects/{projectId}/rfqs/{rfqId}/attachments/{fileId}/{fileName}
organizations/{organizationId}/projects/{projectId}/bids/{bidId}/attachments/{fileId}/{fileName}
organizations/{organizationId}/projects/{projectId}/change-orders/{changeOrderId}/attachments/{fileId}/{fileName}
```

Rules:

- Never expose public permanent file URLs for sensitive files.
- Use signed URLs after permission checks.
- Store file metadata in Postgres.
- Virus scan later if required for production.

## Email/Invite Provider

Recommended providers:

- Resend for developer speed.
- Postmark for high deliverability.
- AWS SES for AWS-native infrastructure.

Email events:

- Vendor invited to RFQ.
- RFQ updated materially.
- Clarification answered.
- Bid submitted.
- Bid awarded/not selected.
- Change order submitted for approval.
- Change order approved/rejected/revision requested.

V1 must support at least:

- Vendor RFQ invite.
- Bid submitted notification to PM.
- Change-order approval request.

## First Implementation Milestone

Milestone 1 is complete when:

1. Internal user can create project and vendor.
2. Internal user can create/send RFQ.
3. Vendor can open invite link and submit bid.
4. Internal user can compare bids.
5. Internal user can award a bid.
6. Internal user can create change order from award.
7. Approver can approve/reject/request revision.
8. Audit trail captures all major actions.
9. Permission tests pass for internal/vendor boundaries.

