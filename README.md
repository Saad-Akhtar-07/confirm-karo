# ConfirmKaro

ConfirmKaro confirms Shopify Cash-on-Delivery orders over WhatsApp, records the lifecycle in Google Sheets, and uses Shopify tags to tell operators what may or may not ship. Fastn owns the connections, workflows, triggers, configuration, retries, state, and observability.

## Built product

The current build is single-merchant Path A. All workflows use the current Fastn organisation connections for merchant `demo-merchant-1`.

| Component | Fastn ID | State |
|---|---|---|
| Configuration | `cfg_814c42766561` | Active; linked to the widget |
| Operations widget | `wgt_9a88332dbfc5` | Active |
| WF-01 order created | `wf_db9f910b9cd1` | Published v3 (`wv_e804275bb941`) |
| Shopify `orders/create` trigger | `6f1dbb61-f630-45d7-84a1-2f6a688c759a` | Active |
| WF-02 WhatsApp reply | `wf_41e087c038ef` | Published v1 (`wv_1bb2c384308f`) |
| WhatsApp `messages` trigger | `f7bf85b9-4ee4-4e08-824e-94d06fb41483` | Active; requires Worker forwarding |
| WF-03 reminder/cutoff | `wf_4162dc5d7a1a` | Published v1 (`wv_70888c0cd973`) |
| One-minute schedule | `1136e944-8410-41b7-a9da-a572092dae11` | Active, Asia/Karachi |

### WF-01 — Shopify order intake

1. Receives Shopify `orders/create`.
2. Accepts configured COD gateways and, for the hackathon demo, named card gateways so a paid Shopify test order can start the same confirmation flow.
3. Deduplicates by `merchant_id + order_id` using Fastn state and the Sheet ledger.
4. Uses `cod_order_confirmation` only when its status is `APPROVED`; otherwise sends an interactive two-button message.
5. Writes a 13-column ledger row and adds `confirmkaro-pending`.
6. Missing phone data becomes `UNVERIFIED` plus `confirmkaro-do-not-ship`; no WhatsApp message is sent.

Button IDs are deliberately unsigned for this demo:

- `CONFIRM_<merchant_id>*<order_id>`
- `CANCEL*<merchant_id>_<order_id>`

Shopify protected customer fields were absent in the live webhook. The workflow therefore supports demo-only `note_attributes` named `confirmkaro_phone`, `confirmkaro_customer_name`, and `confirmkaro_city`. Production should obtain Shopify protected customer-data access; otherwise an order safely becomes `UNVERIFIED`.

### WF-02 — customer decision

WF-02 accepts both Meta payload variants:

- `button.payload`
- `interactive.button_reply.id`

Confirm changes the Sheet status to `CONFIRMED` and applies `confirmkaro-confirmed`. Cancel changes the Sheet status to `CANCELLED` and applies `confirmkaro-cancelled` plus `confirmkaro-do-not-ship`. Repeated taps are ignored.

### WF-03 — reminder and cutoff

The scheduler runs every minute. It sends no more than one reminder after 120 seconds. At 300 seconds without a final reply, it marks the ledger row `EXPIRED` and applies unverified + do-not-ship tags.

## Safety boundary

ConfirmKaro never cancels or fulfills a Shopify order. All operational decisions are represented by tags and the Sheet ledger. The live validation verified `cancelled_at = null` and `fulfillment_status = null` for confirm, cancel, and cutoff cases.

## WhatsApp ingress Worker

The Fastn WhatsApp connector did not subscribe to the `messages` event (`subscriptionStatus: NONE`), and a real inbound “hi” produced no execution. The minimal Worker in `cloudflare-worker/` verifies Meta requests and forwards them to the WF-02 Fastn webhook:

`https://webhooks.fastn.dev/prod/triggers/personal_172f7f319e67396c4dcc/webhooks/f7bf85b9-4ee4-4e08-824e-94d06fb41483`

The Worker is deployed at:

`https://confirmkaro-whatsapp-ingress.confirmkaro.workers.dev`

These encrypted Worker secrets are configured:

- `VERIFY_TOKEN`
- `META_APP_SECRET`
- `FASTN_WEBHOOK_URL`

Set the Worker URL as the Meta WhatsApp callback with verify token `confirmkaro2026`, then subscribe the app to `messages`. The earlier logging trigger is disabled.

## Acceptance evidence

Passed live: cases 1, 3, 4, 5, 6, 7, 11, 12, and 20. Representative persisted executions:

- WF-01 Shopify trigger: `exec_0a5ddec42ca2`
- WF-02 published direct replay: `exec_486b136bedc0`
- WF-03 scheduler: `exec_3acbbd8028f1`

Physical WhatsApp button-tap delivery still requires the deployed Worker URL to be registered as Meta's callback. WF-02 itself was live-tested with both raw Meta envelope shapes against real Shopify orders and the real Sheet; those envelope inputs were simulated fixtures.

## Frontend dashboard

The Vite + React frontend is complete as a demo UI. Its operational data is intentionally static today.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` to configure widget URLs. Do not commit `.env` or credentials.

## Roadmap — explicitly not built today

- Path B multi-tenant installations and per-customer config clones
- WF-04
- Manual commands
- General backend proxy
- Second tenant
- Frontend live data layer

These are design/roadmap items only, not part of the current working product.

## Security

Credentials belong in Fastn Secrets or Cloudflare Worker secrets. Never commit Shopify tokens, Meta access tokens/app secrets, Google credentials, local environment files, or screenshots containing secrets.

Project history and detailed evidence are in [HACKATHON_JOURNEY.md](HACKATHON_JOURNEY.md). The approved product design is in [FINAL_PRODUCT_PLAN.md](FINAL_PRODUCT_PLAN.md).
