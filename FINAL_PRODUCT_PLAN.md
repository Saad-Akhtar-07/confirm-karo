# ConfirmKaro Final Product Plan

Date: 19 September 2026  
Submission deadline: 3:30 PM PKT  
Status: PLAN only — no workflows, triggers, configs, widgets, or frontend integration code have been created from this plan.

## 1. Product definition

ConfirmKaro is a multi-tenant SaaS for Pakistani Shopify merchants. It prevents unconfirmed Cash-on-Delivery orders from reaching dispatch by asking the customer to confirm or cancel on WhatsApp, recording every transition, reminding non-responders, and placing a clear fulfillment guard on risky orders.

The product promise is simple:

> Every COD order is confirmed before dispatch, with a visible audit trail and a safe exception queue.

### Users

- Merchant owner: connects accounts, chooses policies, and monitors confirmation performance.
- Operations staff: works the pending/unverified queue and performs manual actions.
- Customer: confirms or cancels from WhatsApp.
- ConfirmKaro administrator: monitors workflow health and failed executions without seeing merchant credentials.

## 2. System responsibilities

| System | Responsibility |
|---|---|
| Shopify | Source of truth for the order, customer, payment method, and fulfillment guard tags. |
| WhatsApp Business | Confirmation request, reminder, reply, and delivery-status channel. |
| Google Sheets | Merchant-readable operations ledger and reporting projection. It is not the sole source of workflow truth. |
| Fastn | Tenant-aware connections, dynamic configuration, workflow execution, triggers, retries, idempotency, observability, and the embedded setup widget. |
| ConfirmKaro frontend | Seller-facing overview, order queue, manual actions, setup status, workflow health, and activity history. |

## 3. Verified starting state

The live Fastn workspace is `hackathon-codestorm`, test environment.

- Shopify connection: ACTIVE; order read/update actions are available.
- Google Sheets connection: ACTIVE; read, append, and update actions are available.
- WhatsApp Business connection: ACTIVE; send text, template, interactive, and media actions are available.
- Shopify `orders/create` and `orders/updated` events are registered by the connector.
- WhatsApp `messages` event is available but is not yet bound.
- Google Sheets exposes no app events, so it is a target/read model rather than a trigger source.
- WhatsApp WABA ID and phone-number ID exist in Fastn test environment configuration.
- Current Fastn build state: 0 workflows, 0 app triggers, 0 schedules, 0 generic webhook triggers, 0 saved configs, and 0 widgets.
- Current frontend state: complete visual prototype using demo data, with three placeholder widget slots and no live data API.

## 4. Product rules

### Order eligibility

Process an order only when all of these are true:

1. It is a Cash-on-Delivery order.
2. It is not already cancelled or fulfilled.
3. It belongs to the current merchant tenant.
4. It has not already entered ConfirmKaro for the same merchant and Shopify order ID.

An eligible order with no usable phone number is recorded as `UNVERIFIED`, tagged `confirmkaro-do-not-ship`, and sent to the attention queue. No WhatsApp message is attempted.

### Status model

| Status | Meaning | Shopify tags |
|---|---|---|
| `PENDING` | Initial confirmation sent; awaiting a valid response. | `confirmkaro-pending` |
| `REMINDED` | At least one reminder sent; still awaiting a response. | `confirmkaro-pending`, `confirmkaro-reminded` |
| `CONFIRMED` | Customer confirmed the order. | `confirmkaro-confirmed`; remove pending/do-not-ship/cancelled tags |
| `CANCELLED` | Customer cancelled the order. | `confirmkaro-cancelled`, `confirmkaro-do-not-ship`; remove pending tag |
| `UNVERIFIED` | Missing/invalid phone, delivery failure, or reminder deadline exhausted. | `confirmkaro-unverified`, `confirmkaro-do-not-ship`; remove pending tag |

ConfirmKaro will not cancel or fulfill Shopify orders automatically in v1. It applies tags and a do-not-ship guard; a merchant remains in control of destructive commerce actions.

### Identity and correlation

- Order key: `merchant_id + Shopify order_id`.
- Message key: WhatsApp message ID (`wamid`).
- Customer phone: normalized to E.164 before matching or sending.
- Reply correlation: prefer the WhatsApp reply context/message ID; fall back to a signed button payload containing merchant and order identifiers; only as a last resort use the latest open order for the normalized phone.
- Every event and manual command must be safe to replay.

## 5. One dynamic merchant configuration

Fastn should hold one editable configuration template for the entire ConfirmKaro use case. Every workflow reads it at runtime; no merchant policy is hard-coded in workflow code.

Recommended fields:

- Merchant identity: `merchant_id`, display name, timezone, and default language.
- Shopify policy: recognized COD payment labels and tag names.
- WhatsApp policy: phone-number ID, approved confirmation template, approved reminder template, template language, and button/text aliases.
- Reminder policy: first reminder delay, final cutoff, maximum reminders, and allowed sending window.
- Sheet destination: spreadsheet ID, worksheet name, and the approved column mapping.
- Safety policy: behavior for missing phone, failed delivery, ambiguous reply, and late confirmation.

The fixed matching key is `merchant_id + order_id`. The user-editable mapping from Shopify to Sheets is proposed and reviewed once, then reused by every workflow.

## 6. Data contract

The Google Sheet remains the human-readable ledger with these columns:

`merchant_id | order_id | order_name | customer_name | phone | total | city | status | confirmation_sent_at | reply | reply_at | reminder_count | last_updated`

Recommended source mapping:

| Sheet column | Source or rule |
|---|---|
| `merchant_id` | Current Fastn tenant/configuration |
| `order_id` | Shopify order `id`; immutable matching key component |
| `order_name` | Shopify order `name` |
| `customer_name` | Shipping name, then customer name fallback |
| `phone` | Shipping phone, then order/customer phone fallback; normalized to E.164 |
| `total` | Shopify total price plus currency retained in workflow/audit metadata |
| `city` | Shopify shipping address city |
| `status` | ConfirmKaro state machine |
| `confirmation_sent_at` | UTC timestamp of accepted WhatsApp send |
| `reply` | Normalized `CONFIRM`, `CANCEL`, or sanitized raw reply |
| `reply_at` | UTC timestamp of accepted inbound message |
| `reminder_count` | Integer, initially `0` |
| `last_updated` | UTC timestamp of the latest successful state transition |

The frontend can format timestamps in the merchant timezone and totals in PKR for the demo, but the integration stores unambiguous UTC timestamps and preserves currency.

## 7. Workflow and trigger design

### WF-01 — COD order intake and confirmation request

Trigger: Shopify app event `orders/create`.

Flow:

1. Receive the event and fetch the full Shopify order.
2. Load the current merchant configuration.
3. Check COD eligibility, cancellation/fulfillment state, tenant ownership, and idempotency key.
4. Normalize the phone number.
5. If the phone is missing/invalid, write `UNVERIFIED`, apply the do-not-ship tags, and end successfully with a business exception.
6. Upsert the Sheet row before sending so the order is visible even if messaging fails.
7. Send the approved WhatsApp confirmation template, preferably with Confirm and Cancel quick-reply buttons.
8. Store the outbound message ID for future reply/status correlation.
9. Set `PENDING`, timestamp the send, and apply the pending Shopify tag.
10. Emit an auditable result containing the order key, message ID, and affected systems.

Idempotency: one confirmation request and one Sheet row per merchant/order key. A duplicate Shopify event returns the existing result without sending again.

### WF-02 — WhatsApp reply and delivery-status processor

Trigger: WhatsApp Business app event `messages`.

This single connector event carries two shapes and the workflow branches early:

- `messages[]`: inbound customer content.
- `statuses[]`: outbound sent/delivered/read/failed status updates.

Inbound branch:

1. Deduplicate by inbound WhatsApp message ID.
2. Normalize sender and correlate the reply to an open order.
3. Accept structured button payloads first; also recognize conservative text aliases such as `CONFIRM`, `YES`, `CANCEL`, and `NO` from configuration.
4. For confirm: set `CONFIRMED`, update the Sheet, update Shopify tags, and send a short acknowledgement.
5. For cancel: set `CANCELLED`, update the Sheet, apply `confirmkaro-do-not-ship`, and send an acknowledgement.
6. For an ambiguous reply: keep the order open and send one clarification prompt without incrementing the reminder count.
7. If no order can be safely correlated, log an exception and do not modify Shopify.

Status branch:

1. Record delivery/read state against the outbound message ID.
2. A permanent failed delivery moves the order to `UNVERIFIED`, applies do-not-ship, and surfaces it in the attention queue.
3. Delivery/read events do not change the customer confirmation status.

Late reply rule: a valid late confirmation may move `REMINDED` or `UNVERIFIED` to `CONFIRMED` and remove do-not-ship; a cancellation always leaves do-not-ship in place. Operations sees the transition in the audit log.

### WF-03 — Pending-order reminder and cutoff sweep

Trigger: Fastn schedule. Recommended initial cadence is every 15 minutes; the exact cadence and merchant timezone are confirmed when the schedule is armed.

Flow:

1. Load the merchant configuration and all open `PENDING`/`REMINDED` orders due for action.
2. Skip orders already resolved in Shopify or by a concurrent reply.
3. Send the approved reminder template when the first threshold is reached.
4. Increment `reminder_count`, set `REMINDED`, and update the Sheet.
5. At the final cutoff or maximum reminder count, set `UNVERIFIED` and apply `confirmkaro-do-not-ship` instead of sending endlessly.
6. Use an idempotency key containing merchant, order, and reminder number so a retried schedule cannot duplicate a reminder.

### WF-04 — Reconciliation and self-healing

Trigger: Fastn schedule. Recommended for the demo: one manual run before recording. Recommended production cadence: hourly, confirmed when armed.

Flow:

1. Read recently changed Shopify COD orders and corresponding Sheet rows in bounded pages.
2. Detect missing rows, stale statuses, missing/incorrect Shopify guard tags, and events that failed before completion.
3. Repair safe projection errors automatically.
4. Never resend a confirmation or reminder unless the relevant idempotency record proves it was not accepted.
5. Produce a compact reconciliation summary for the activity log and verification evidence.

This schedule is the completeness partner to the real-time event flows; it prevents a missed webhook from silently losing an order.

### Manual commands from the frontend

The order drawer exposes controlled Fastn-backed commands:

- Send reminder now.
- Mark confirmed after an offline confirmation.
- Mark cancelled / do not ship.
- Retry a failed Sheet or Shopify projection.

Each command requires the order ID and an optimistic version/last-updated value, runs the same validation/idempotency logic as automatic flows, and writes an audit entry. The browser must not hold provider tokens or a reusable Fastn secret.

## 8. Trigger inventory

| Trigger | Available now | Planned use |
|---|---:|---|
| Shopify `orders/create` | Yes; registered | Bind to WF-01. |
| Shopify `orders/updated` | Yes; registered | Do not bind initially to avoid feedback loops; reconciliation reads updates safely. |
| WhatsApp `messages` | Yes; not registered/bound | Register and bind to WF-02. |
| WhatsApp template/account/quality events | Available | Out of v1 workflow scope; monitor only if time remains. |
| Google Sheets event | No | None; Sheets is a target/read model. |
| Fastn schedule | Available | Bind to WF-03 and WF-04 after cadence approval. |
| Generic inbound webhook | Available, none created | Reserve for authenticated frontend commands only if a thin backend/callable workflow is chosen. Do not use it instead of native Shopify/WhatsApp events. |

## 9. Frontend completion plan

The current UI stays visually intact, but demo data is replaced behind a small data-access layer.

### Overview

- Live totals: COD orders today, awaiting confirmation, confirmation rate, and protected revenue.
- Attention queue: missing phone, failed delivery, cutoff reached, and projection failures.
- Connection and workflow health from Fastn.

### Orders

- Live paginated orders from the ConfirmKaro ledger/read API.
- Existing search and status filters remain.
- Order drawer shows timeline, message delivery state, reminder count, Shopify tag state, and manual commands.

### Automations

- Keep the three connector cards as status summaries.
- Replace the three separate widget placeholders with one `Set up ConfirmKaro` Fastn widget containing all connectors and configuration.
- Show four workflow health rows and their last successful run.

### Activity

- Replace repeated demo records with normalized Fastn execution/business events.
- Export only the current merchant's sanitized audit rows.

### Safe frontend architecture

- Do not call Shopify, WhatsApp, or Google directly from React.
- Do not place Fastn API keys or provider credentials in `VITE_*` variables.
- Use an authenticated same-origin backend/serverless proxy or Fastn's approved tenant/embed mechanism for reads and manual commands.
- The one Fastn widget URL/embed token is short-lived or tenant-scoped; the browser receives no reusable provider secret.

## 10. Multi-tenant onboarding

Recommended final-product path: Fastn multi-tenant Path B.

1. The merchant signs in to ConfirmKaro.
2. The backend creates/resolves a Fastn tenant using ConfirmKaro's immutable merchant ID.
3. One embedded Fastn widget asks the merchant to connect Shopify, WhatsApp Business, and Google Sheets and review ConfirmKaro settings.
4. Shopify, WhatsApp, and Sheets are resolved from that merchant's installation, never from another merchant's pooled connection.
5. The approved configuration is the tenant clone of one ConfirmKaro template.
6. Every workflow resolves the tenant and configuration from trusted execution context, not a client-supplied merchant ID alone.

For the hackathon demo, the current three org-level connections act as merchant one. Before claiming tenant isolation, create a second test merchant/installation and prove that each sees only its own connections, config, orders, and executions.

## 11. Reliability, security, and observability

- Credentials live only in Fastn connections/secrets; identifiers live in environment config or tenant config.
- PII is minimized in logs; the UI masks phone numbers in list views.
- Validate all event shape, tenant context, button payloads, and manual-command authorization.
- Retry transient 429/5xx failures with bounded backoff; do not retry permanent validation/auth failures indefinitely.
- Record partial completion per system so a repair run resumes instead of duplicating earlier writes.
- Keep a dead-letter/attention queue for exhausted failures.
- Publish every workflow only after its acceptance suite passes; saved drafts do not count as shipped.
- Re-run the full suite after any code/config/trigger change.

## 12. Acceptance test gate

Approve these cases before workflow construction:

1. Valid COD order creates one row, sends one confirmation, and gets the pending tag.
2. Non-COD order is ignored with no message or row.
3. Missing/invalid phone becomes `UNVERIFIED` and do-not-ship without a send attempt.
4. Duplicate Shopify event produces no duplicate row or message.
5. Confirm button/text changes Sheet and Shopify to `CONFIRMED`.
6. Cancel button/text changes Sheet and Shopify to `CANCELLED` plus do-not-ship.
7. Duplicate WhatsApp delivery or reply event is harmless.
8. Ambiguous reply prompts once and leaves the order pending.
9. Uncorrelated reply changes no order and creates an attention event.
10. Delivery failure becomes `UNVERIFIED` and do-not-ship.
11. First due reminder sends once and increments the counter once.
12. Final cutoff sends no endless reminders and applies do-not-ship.
13. Late valid confirmation removes do-not-ship and becomes `CONFIRMED`.
14. Shopify/Sheets/WhatsApp transient failure retries safely; permanent failure is visible.
15. Reconciliation repairs a deliberately stale Sheet row or missing Shopify tag.
16. Manual action is authorized, version-checked, idempotent, and audited.
17. Merchant A cannot read, update, trigger, or configure Merchant B data.
18. Every bound trigger produces a correlated Fastn execution; every workflow is published.
19. The widget reads back with all three connectors, all four workflows/triggers, and the approved config attached.
20. One real end-to-end COD order completes from Shopify through WhatsApp reply to final Sheet/Shopify state.

## 13. Build order and approval gates

### Gate 1 — Product plan

Confirm this document, especially multi-tenancy, reminder timing, and the non-destructive do-not-ship policy.

### Phase 2 — Map

- Probe real Shopify order output, the Sheet header/range, and WhatsApp send inputs.
- Propose the one configuration and 1:1 field mapping in Fastn.
- Review and approve it at the Fastn review URL.

### Gate 2 — Acceptance cases

Create the Fastn test-case draft from section 12 and wait for explicit approval.

### Phase 3 — Build

Build in this order: WF-01, WF-02, WF-03, WF-04, then the single widget. Test and publish each workflow before binding its trigger.

### Phase 4 — Verify

- Fire every trigger and correlate it to a real execution.
- Confirm all connections are usable at handoff.
- Read back published workflows, triggers, widget attachments, and configuration.
- Prove config liveness by changing a harmless marker and observing the next run.
- Run the complete acceptance suite and produce a verification report.

### Phase 5 — Frontend wiring and evidence

- Replace demo data with the authenticated data layer.
- Replace three setup slots with one widget entry point.
- Record screenshots, execution IDs, demo order IDs, and the final video.
- Update README and hackathon journey with verified claims only.

## 14. Deadline-prioritized delivery

With the 3:30 PM deadline, the submission-critical path is:

1. WF-01 real order intake.
2. WF-02 real confirmation/cancellation reply.
3. WF-03 one reminder/cutoff path.
4. One approved config and one widget.
5. One end-to-end real order plus duplicate-event and missing-phone tests.
6. Frontend live order list/status and recorded evidence.

WF-04 reconciliation, second-merchant isolation proof, rich delivery analytics, and all manual actions are the first hardening items if the core path threatens the submission window. They remain part of the final product design and must not be falsely presented as complete in the demo.

## 15. Decisions awaiting confirmation

- Tenancy: use multi-tenant Path B for the final product; use the current org connections as merchant one for the demo.
- Safety: tags/do-not-ship only; never auto-cancel or auto-fulfill in v1.
- Recommended reminder policy: first reminder after 30 minutes, final cutoff after 90 minutes, maximum one reminder for the hackathon demo.
- Recommended reconciliation: manual before demo, hourly in production.
- WhatsApp content: only approved Meta templates for business-initiated messages; structured buttons preferred over free-text parsing.

No build should start until these business decisions and the plan are approved.
