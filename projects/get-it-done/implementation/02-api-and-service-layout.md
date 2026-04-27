# Get It Done API and Service Layout

## Design Rule

Route handlers should be thin.

They should:

1. Authenticate actor.
2. Parse and validate input.
3. Call a domain service.
4. Return result.

They should not contain business rules for permissions, workflow transitions, audit creation, or multi-entity transactions. Those belong in services/domain helpers.

---

## API Route Map

## Projects

### `GET /api/projects`

Purpose:

List projects visible to the current user.

Authorization:

- Internal authenticated user.
- Filter by organization and project membership unless admin.

Response:

- Project list with status and counts.

### `POST /api/projects`

Purpose:

Create project.

Service:

`projectService.createProject(actor, input)`

Required input:

- name
- location
- ownerName
- projectNumber optional

Audit:

- `project.created`

---

## Vendors

### `GET /api/vendors`

Purpose:

List vendors in organization.

Authorization:

- Admin, project manager, estimator.

### `POST /api/vendors`

Purpose:

Create vendor.

Service:

`vendorService.createVendor(actor, input)`

Audit:

- `vendor.created`

---

## RFQs

### `GET /api/rfqs?projectId={projectId}`

Purpose:

List RFQs for project.

Authorization:

- Project member with view permission.

### `POST /api/rfqs`

Purpose:

Create RFQ draft.

Service:

`rfqService.createDraft(actor, input)`

Required input:

- projectId
- title
- trade
- scopeSummary
- instructions
- dueAt
- allowLateBids

Audit:

- `rfq.created`

### `GET /api/rfqs/{rfqId}`

Purpose:

Get RFQ detail for internal user.

Authorization:

- Project member with view permission.

### `PATCH /api/rfqs/{rfqId}`

Purpose:

Update draft/reopened RFQ.

Service:

`rfqService.updateDraft(actor, rfqId, input)`

Guard:

- RFQ status must allow editing.

Audit:

- `rfq.updated`

### `POST /api/rfqs/{rfqId}/send`

Purpose:

Send RFQ to selected vendors.

Service:

`rfqService.send(actor, rfqId, input)`

Input:

- vendorIds
- optional message

Transaction:

1. Validate RFQ required fields.
2. Create invites.
3. Generate token hashes.
4. Set RFQ status to `sent`.
5. Create audit event.
6. Queue/send invite emails.

Audit:

- `rfq.sent`
- `invite.sent` per invite

### `POST /api/rfqs/{rfqId}/close`

Purpose:

Close RFQ without award.

Service:

`rfqService.close(actor, rfqId, reason)`

Audit:

- `rfq.closed`

### `POST /api/rfqs/{rfqId}/cancel`

Purpose:

Cancel RFQ.

Service:

`rfqService.cancel(actor, rfqId, reason)`

Audit:

- `rfq.cancelled`

### `GET /api/rfqs/{rfqId}/compare`

Purpose:

Get bid comparison data.

Service:

`bidService.getComparison(actor, rfqId)`

Authorization:

- Project member with bid review permission.

Audit:

- Optional `bid_comparison.viewed`

---

## Vendor RFQ Access

### `GET /api/vendor/rfq/{inviteToken}`

Purpose:

Resolve invite token and return scoped RFQ view.

Service:

`rfqService.getVendorRfqView(inviteToken)`

Behavior:

1. Hash token.
2. Find active invite.
3. Check expiration/cancelled status.
4. Mark invite viewed if first view.
5. Mark RFQ viewed if applicable.
6. Create audit event.

Audit:

- `invite.viewed`
- `rfq.viewed`

### `POST /api/vendor/rfq/{inviteToken}/decline`

Purpose:

Vendor declines RFQ.

Service:

`rfqService.declineInvite(inviteToken, input)`

Audit:

- `invite.declined`

---

## Bids

### `POST /api/bids`

Purpose:

Submit bid from vendor invite.

Service:

`bidService.submitFromInvite(inviteToken, input)`

Input:

- totalAmountCents
- currency
- scopeIncluded
- exclusions
- assumptions optional
- scheduleNotes optional
- attachmentIds optional

Transaction:

1. Resolve invite.
2. Check RFQ status and due date.
3. Determine submitted vs late_submitted.
4. Create bid.
5. Create bid version.
6. Update invite responded status.
7. Update RFQ status to bid_submitted if needed.
8. Create audit events.
9. Notify PM/estimator.

Audit:

- `bid.submitted` or `bid.late_submitted`

### `POST /api/bids/{bidId}/revise`

Purpose:

Vendor revises bid.

Service:

`bidService.reviseFromInvite(inviteToken, bidId, input)`

Guard:

- Bid must be revisable.
- Cannot revise awarded bid without explicit allowed path.

Audit:

- `bid.revised`

### `POST /api/bids/{bidId}/withdraw`

Purpose:

Vendor withdraws bid.

Service:

`bidService.withdrawFromInvite(inviteToken, bidId, reason)`

Audit:

- `bid.withdrawn`

---

## Awards

### `POST /api/awards`

Purpose:

Award a bid.

Service:

`awardService.awardBid(actor, input)`

Input:

- rfqId
- bidId
- awardNotes

Transaction:

1. Check actor can award.
2. Check RFQ is awardable.
3. Check bid belongs to RFQ and is awardable.
4. Create award.
5. Mark selected bid `awarded`.
6. Mark other submitted/revised/under_review bids `not_selected`.
7. Mark RFQ `awarded`.
8. Create audit event.
9. Send award/not-selected notifications.

Audit:

- `award.created`
- `bid.awarded`
- `bid.not_selected`
- `rfq.awarded`

### `POST /api/awards/{awardId}/reverse`

Purpose:

Reverse an award by exception.

Service:

`awardService.reverseAward(actor, awardId, reason)`

Guard:

- Admin/PM only.
- Requires reversal reason.

Audit:

- `award.reversed`

---

## Change Orders

### `POST /api/change-orders/from-award`

Purpose:

Create draft change order from awarded bid.

Service:

`changeOrderService.createFromAward(actor, awardId, input)`

Prefill:

- organizationId
- projectId
- rfqId
- bidId
- awardId
- vendorId
- costImpactCents
- scopeDescription

Audit:

- `change_order.created`

### `PATCH /api/change-orders/{changeOrderId}`

Purpose:

Update draft or revision-requested change order.

Service:

`changeOrderService.updateDraft(actor, changeOrderId, input)`

Audit:

- `change_order.updated`

### `POST /api/change-orders/{changeOrderId}/submit`

Purpose:

Submit change order for approval.

Service:

`changeOrderService.submit(actor, changeOrderId, input)`

Input:

- approverName
- approverEmail
- approverUserId optional

Audit:

- `change_order.submitted`
- `approval.requested`

### `POST /api/change-orders/{changeOrderId}/approve`

Purpose:

Approve change order.

Service:

`changeOrderService.decideApproval(actor, changeOrderId, { decision: "approved", comments })`

Audit:

- `approval.approved`
- `change_order.approved`

### `POST /api/change-orders/{changeOrderId}/reject`

Purpose:

Reject change order.

Service:

`changeOrderService.decideApproval(actor, changeOrderId, { decision: "rejected", comments })`

Audit:

- `approval.rejected`
- `change_order.rejected`

### `POST /api/change-orders/{changeOrderId}/request-revision`

Purpose:

Request change order revision.

Service:

`changeOrderService.decideApproval(actor, changeOrderId, { decision: "revision_requested", comments })`

Audit:

- `approval.revision_requested`
- `change_order.revision_requested`

---

## Files

### `POST /api/files/presign`

Purpose:

Create signed upload URL.

Service:

`fileService.createPresignedUpload(actor, input)`

Input:

- entityType: rfq | bid | change_order
- entityId
- fileName
- fileType
- fileSizeBytes

Authorization:

- Actor must have write access to entity.

### `GET /api/files/{fileId}/download`

Purpose:

Create signed download URL.

Service:

`fileService.createPresignedDownload(actor, fileId)`

Authorization:

- Actor must have read access to owning entity.

---

## Service Contracts

## `projectService`

```ts
createProject(actor, input): Promise<Project>
addProjectMember(actor, projectId, input): Promise<ProjectMember>
listVisibleProjects(actor): Promise<Project[]>
assertProjectAccess(actor, projectId, capability): Promise<ProjectAccess>
```

## `vendorService`

```ts
createVendor(actor, input): Promise<Vendor>
updateVendor(actor, vendorId, input): Promise<Vendor>
listVendors(actor, filters): Promise<Vendor[]>
```

## `rfqService`

```ts
createDraft(actor, input): Promise<RFQ>
updateDraft(actor, rfqId, input): Promise<RFQ>
send(actor, rfqId, input): Promise<RFQSendResult>
getInternalView(actor, rfqId): Promise<RFQDetail>
getVendorRfqView(inviteToken): Promise<VendorRFQView>
close(actor, rfqId, reason): Promise<RFQ>
cancel(actor, rfqId, reason): Promise<RFQ>
```

## `bidService`

```ts
submitFromInvite(inviteToken, input): Promise<Bid>
reviseFromInvite(inviteToken, bidId, input): Promise<Bid>
withdrawFromInvite(inviteToken, bidId, reason): Promise<Bid>
getComparison(actor, rfqId): Promise<BidComparison>
```

## `awardService`

```ts
awardBid(actor, input): Promise<Award>
reverseAward(actor, awardId, reason): Promise<Award>
```

## `changeOrderService`

```ts
createFromAward(actor, awardId, input): Promise<ChangeOrder>
updateDraft(actor, changeOrderId, input): Promise<ChangeOrder>
submit(actor, changeOrderId, input): Promise<ChangeOrder>
decideApproval(actor, changeOrderId, input): Promise<ChangeOrder>
```

## `auditService`

```ts
record(tx, event): Promise<AuditEvent>
listForEntity(actor, entityType, entityId): Promise<AuditEvent[]>
```

## `fileService`

```ts
createPresignedUpload(actor, input): Promise<PresignedUpload>
finalizeUpload(actor, input): Promise<FileRecord>
createPresignedDownload(actor, fileId): Promise<PresignedDownload>
```

## `emailService`

```ts
sendVendorInvite(input): Promise<void>
sendBidSubmittedNotification(input): Promise<void>
sendChangeOrderApprovalRequest(input): Promise<void>
sendChangeOrderDecisionNotification(input): Promise<void>
```

---

## Mutation Transaction Requirements

These operations must run inside DB transactions:

| Operation | Reason |
|---|---|
| Send RFQ | RFQ status, invites, audit events must stay consistent |
| Submit bid | Bid, bid version, invite status, RFQ status, audit event must stay consistent |
| Award bid | Award, selected bid, non-selected bids, RFQ, audit events must stay consistent |
| Create CO from award | CO and audit event must stay consistent |
| Submit CO | CO status, approval row, audit event must stay consistent |
| Decide approval | Approval decision, CO status, audit event must stay consistent |

Email sending can be after transaction commit or via outbox pattern later.

