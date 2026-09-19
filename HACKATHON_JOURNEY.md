# ConfirmKaro Hackathon Journey

Date: 19 September 2026  
Hard deadline: 3:30 PM  
Current user role: Partner B — Fastn, Codex, and repository setup

This file is the persistent context for the hackathon. Update it after every milestone, bug, confusing Fastn behavior, important decision, and verification result. Store screenshots under `evidence/`, keeping anything with credentials or personal phone numbers under `evidence/private/` so Git ignores it.

## Product goal

Build a multi-tenant SaaS for Pakistani online sellers that confirms Cash-on-Delivery Shopify orders over WhatsApp before dispatch. Fastn owns the integrations, workflows, triggers, dynamic configuration, secrets, retries, and observability. Google Sheets records the order lifecycle.

## Milestone map

- [ ] M1 — Accounts and integration setup
- [ ] M2 — Workflow 1: new order → WhatsApp confirmation → Sheet row
- [ ] M3 — Workflow 2: customer reply → Shopify tag + Sheet update
- [ ] M4 — Workflow 3: scheduled reminder and “do not ship” flag
- [ ] M5 — Hardening: duplicate handling, error handling, per-merchant configuration
- [ ] M6 — Widget, embedding, landing page, and second test merchant
- [ ] M7 — Video, screenshots, README, submission, and feedback forms

## M1 — Accounts and integration setup

### Partner A responsibilities

- [ ] Create a Shopify development store such as `confirmkaro-demo`.
- [ ] Add two or three products priced in PKR.
- [ ] Enable Cash on Delivery.
- [ ] Require a shipping-address phone number at checkout.
- [ ] Record the `*.myshopify.com` domain.
- [ ] Prepare a Shopify Admin API token as backup with `read_orders`, `write_orders`, and `read_customers`.
- [ ] Create and test the Twilio WhatsApp sandbox.
- [ ] Join both test phones to the sandbox and record the Account SID, Auth Token, and sandbox number.
- [ ] Create the `ConfirmKaro Orders` Google Sheet and share it with Partner B as editor.
- [ ] Share credentials privately; never send them in the hackathon group or commit them.

Required sheet headers:

`merchant_id | order_id | order_name | customer_name | phone | total | city | status | confirmation_sent_at | reply | reply_at | reminder_count | last_updated`

### Partner B responsibilities

- [ ] Rename the Fastn organization to `hackathon-<team-name>`.
- [ ] Invite Partner A to the Fastn organization.
- [x] Add the Fastn MCP server to Codex; Fastn tools are visible in this task.
- [ ] Confirm the Fastn Workspace account connection inside this Codex task.
- [x] Create the local ConfirmKaro project folder.
- [x] Initialize the project briefing and persistent journey files.
- [ ] Initialize the local Git repository.
- [ ] Run the Fastn smoke test: list available connectors and confirm whether Shopify, Twilio, and Google Sheets exist. Do not build workflows during this smoke test.

### Together, after Partner A completes account setup

- [ ] Create Active Fastn connections for Shopify, Twilio, and Google Sheets.
- [ ] Store the Shopify and Twilio secrets in Fastn Secrets.
- [ ] Fetch Shopify shop information through Fastn.
- [ ] Read row 1 of the `ConfirmKaro Orders` sheet through Fastn.
- [ ] Send a WhatsApp sandbox message through Fastn and confirm it arrives.
- [ ] Place one COD Shopify test order using a phone that joined the Twilio sandbox.

### M1 completion gate

- [ ] Organization name begins with `hackathon-` and both partners are members.
- [x] Codex exposes the Fastn MCP tools.
- [ ] Shopify, Twilio, and Google Sheets connections are Active in Fastn.
- [ ] A WhatsApp test message sent through Fastn arrived.
- [ ] One COD test order exists with a sandbox-joined phone number.

## Progress log

### 19 September 2026

- Partner B created an empty GitHub repository and will initialize Git and push the local project manually.
- The correct local project folder is `C:\Users\Muhammad Saad Akhtar\Desktop\Fastn Hachathon\Confirm Karo`.
- The temporary local `.git` directory created by Codex was removed at Partner B's request.
- Fastn gateway and integration-builder playbooks were installed for Codex at `C:\Users\Muhammad Saad Akhtar\.agents\skills`.
- Fastn MCP tools are available, but repeated workspace identity calls report that the Fastn Workspace account is not connected even though Partner B has already authorized the MCP with the correct Gmail account. Codex did not attempt another sign-in; the mismatch was filed as Fastn feedback.
- No Shopify, Twilio, Google, or Fastn credentials were written to the repository.

## Bugs and confusing moments

- Moving this task to the Fastn project in the Codex UI did not immediately change the shell working directory; commands must explicitly target the Fastn project path in the current task.
- Fastn MCP tools were visible even though the Fastn Workspace account connection still reported authorization required. Capture this in the mandatory Fastn feedback form if it persists after reauthorization.
