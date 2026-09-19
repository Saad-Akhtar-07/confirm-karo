# ConfirmKaro — Build with Fastn hackathon

We are building a multi-tenant SaaS for Pakistani online sellers that confirms
Cash-on-Delivery orders over WhatsApp before dispatch, built ON Fastn.

Rules:
- All integrations, triggers and workflows live in our Fastn workspace, built via the Fastn MCP tools.
- Systems: Shopify (source), Meta WhatsApp Cloud API / WhatsApp Business (messaging), Google Sheets (order log).
- Never hard-code credentials. Use Fastn Secrets.
- Every workflow must be idempotent (dedupe by Shopify order_id) and log failures.
- Sheet columns: merchant_id, order_id, order_name, customer_name, phone, total, city,
  status, confirmation_sent_at, reply, reply_at, reminder_count, last_updated.
- Statuses: PENDING, CONFIRMED, CANCELLED, REMINDED, UNVERIFIED.
- Before building anything, explain the plan and wait for approval.

## Current role and milestone

- The user is Partner B, responsible for Fastn, Codex, and this repository.
- Work through one milestone at a time.
- Current milestone: M1 — Accounts and integration setup.
- Submission deadline is treated as 3:30 PM.
- Keep `HACKATHON_JOURNEY.md` updated with progress, blockers, bugs, and confusing Fastn behavior.
