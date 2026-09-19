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
- [x] Configure and test a Meta WhatsApp Cloud API test number.
- [x] Record the WhatsApp Business Account ID and phone-number ID in Fastn test-environment configuration; keep the access token in the existing Fastn bearer connection.
- [ ] Create the `ConfirmKaro Orders` Google Sheet and share it with Partner B as editor.
- [ ] Share credentials privately; never send them in the hackathon group or commit them.

Required sheet headers:

`merchant_id | order_id | order_name | customer_name | phone | total | city | status | confirmation_sent_at | reply | reply_at | reminder_count | last_updated`

### Partner B responsibilities

- [ ] Rename the Fastn organization to `hackathon-<team-name>`.
- [ ] Invite Partner A to the Fastn organization.
- [x] Add the Fastn MCP server to Codex; Fastn tools are visible in this task.
- [x] Confirm the Fastn Workspace account connection inside this Codex task.
- [x] Create the local ConfirmKaro project folder.
- [x] Initialize the project briefing and persistent journey files.
- [ ] Initialize the local Git repository.
- [ ] Run the Fastn smoke test: verify the Shopify, WhatsApp Business, and Google Sheets connections with one safe provider call each. Do not build workflows during this smoke test.

### Together, after Partner A completes account setup

- [ ] Create verified Fastn connections for Shopify, WhatsApp Business, and Google Sheets.
- [ ] Store the Shopify and Meta WhatsApp access tokens in Fastn Secrets.
- [ ] Fetch Shopify shop information through Fastn.
- [x] Read row 1 of the `ConfirmKaro Orders` sheet through Fastn.
- [ ] Send a WhatsApp Cloud API test message through Fastn and confirm it arrives.
- [ ] Place one COD Shopify test order using the registered WhatsApp test recipient number.

### M1 completion gate

- [ ] Organization name begins with `hackathon-` and both partners are members.
- [x] Codex exposes the Fastn MCP tools.
- [ ] Shopify, WhatsApp Business, and Google Sheets connections are verified through provider calls in Fastn.
- [ ] A WhatsApp test message sent through Fastn arrived.
- [ ] One COD test order exists with a sandbox-joined phone number.

## Progress log

- 2026-09-19: Built the first seller-facing operations dashboard foundation in React. It includes Overview, Orders, Automations, and Activity views; responsive navigation; order search/filter/detail interactions; realistic demo data; and environment-variable slots for future Shopify, WhatsApp Business, and Google Sheets Fastn widgets. The UI clearly labels demo data and contains no credentials.
- 2026-09-19: Replaced the planned Twilio sandbox with Meta WhatsApp Cloud API because a suitable free Twilio setup was unavailable. The Fastn dashboard screenshot shows Shopify, WhatsApp Business, and Google Sheets as Active, but Active only proves credentials were stored; runtime provider calls are still required. The Fastn MCP tools were not exposed in this Codex turn, so no end-to-end smoke-test result is claimed yet.

### 19 September 2026

- Partner B created an empty GitHub repository and will initialize Git and push the local project manually.
- The correct local project folder is `C:\Users\Muhammad Saad Akhtar\Desktop\Fastn Hachathon\Confirm Karo`.
- The temporary local `.git` directory created by Codex was removed at Partner B's request.
- Fastn gateway and integration-builder playbooks were installed for Codex at `C:\Users\Muhammad Saad Akhtar\.agents\skills`.
- Fastn MCP tools are available, but repeated workspace identity calls report that the Fastn Workspace account is not connected even though Partner B has already authorized the MCP with the correct Gmail account. Codex did not attempt another sign-in; the mismatch was filed as Fastn feedback.
- No Shopify, Meta WhatsApp, Google, or Fastn credentials were written to the repository.
- Fastn Workspace reauthorization succeeded. Codex authenticated as the owner of the `hackathon-codestorm` test workspace.
- Google Sheets was verified through live Fastn provider calls. Spreadsheet `Confirm Karu`, tab `Sheet1`, returned HTTP 200.
- Wrote the approved 13-column schema to `Sheet1!A1:M1` and read it back successfully through Fastn. The sheet contains no order rows yet.
- Frontend inspection confirmed that the React dashboard still uses demo data and only contains placeholder Fastn widget URL slots. No frontend workflow endpoint exists yet, so the dashboard has not been falsely marked live.
- Decision confirmed for the current sheet connection: the owner-operated connection is used in single-tenant mode. The broader product remains designed as a multi-tenant SaaS, with per-merchant configuration deferred to the later hardening/widget milestones.
- WhatsApp Business now appears as an ACTIVE bearer-token connection in Fastn. Fastn reports `verifyStatus: skipped`, so ACTIVE only confirms storage, not that Meta accepted the token.
- Stored the WABA ID and phone-number ID as strings in Fastn test-environment configuration under `confirm_karo_whatsapp_waba_id` and `confirm_karo_whatsapp_phone_number_id`. The bearer token remains in the Fastn connection and was not copied into the repository.
- Verified the WhatsApp Business connection with five read-only Meta Graph API calls through Fastn. Listing phone numbers, reading the exact phone number, reading the business profile, listing message templates, and listing subscribed apps all returned HTTP 200. The test number is on Cloud API with GREEN quality and standard throughput; its code-verification status is `NOT_VERIFIED`.
- The custom `cod_order_confirmation` template exists but is still `PENDING`. Meta's `hello_world` template and several sample templates are `APPROVED`. A subscribed Meta webhook app is present. No WhatsApp message was sent during this read-only smoke test.
- Sent Meta's approved `hello_world` template through Fastn to the registered test recipient `+92 327 8742033`. Meta returned HTTP 200, resolved the same WhatsApp ID, and accepted message `wamid.HBgMOTIzMjc4NzQyMDMzFQIAERgSMjA1Mzg1QzZBQ0I1RjlDRkFEAA==`. Provider acceptance is confirmed; delivery/read confirmation remains asynchronous through the webhook.

## Bugs and confusing moments

- Moving this task to the Fastn project in the Codex UI did not immediately change the shell working directory; commands must explicitly target the Fastn project path in the current task.
- Fastn MCP tools were visible even though the Fastn Workspace account connection still reported authorization required. Capture this in the mandatory Fastn feedback form if it persists after reauthorization.
- The Fastn Workspace authorization mismatch was resolved after reconnecting; the live identity and Google Sheets calls now succeed.
