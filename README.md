# ConfirmKaro

ConfirmKaro is a multi-tenant SaaS prototype for Pakistani online sellers. It confirms Cash-on-Delivery Shopify orders over WhatsApp before dispatch and records the order lifecycle in Google Sheets. The integration layer, triggers, workflows, secrets, and customer configuration live in Fastn.

## Systems

- Shopify development store: order source
- Meta WhatsApp Cloud API: confirmations and customer replies through WhatsApp Business
- Google Sheets: order log and status tracking
- Fastn: connections, workflows, triggers, configuration, secrets, retries, and observability

## Planned flow

1. A new COD Shopify order sends a WhatsApp confirmation and creates a sheet row.
2. A customer reply updates the Shopify order tag and the sheet row.
3. A scheduled reminder follows up on pending orders and flags orders that must not ship.

Project context, milestone status, and blockers are tracked in [HACKATHON_JOURNEY.md](HACKATHON_JOURNEY.md).

## Frontend dashboard

The seller-facing operations dashboard is a Vite + React application with demo data and prepared Fastn widget slots.

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add the Fastn widget URLs when the Shopify, WhatsApp Business, and Google Sheets integrations are ready. Until then, the dashboard intentionally labels all operational data as demo data.

## Security

Credentials must be stored in Fastn Secrets. Do not commit Shopify tokens, Meta access tokens, Google credentials, local environment files, or screenshots containing secrets.
