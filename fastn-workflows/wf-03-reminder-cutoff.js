const CONFIG_ID = "cfg_814c42766561";

function outputOf(result) {
  return result && Object.prototype.hasOwnProperty.call(result, "output") ? result.output : result;
}

function scalar(value) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) return value.value;
  return value;
}

function tagsFrom(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return list.map((tag) => String(tag).trim()).filter(Boolean);
}

function reminderTags(existing, cfg, mode) {
  const managed = Object.values(cfg.shopify.tags);
  const tags = tagsFrom(existing).filter((tag) => !managed.includes(tag));
  if (mode === "REMINDER_SENT") tags.push(cfg.shopify.tags.pending, cfg.shopify.tags.reminded);
  if (mode === "EXPIRED") tags.push(cfg.shopify.tags.unverified, cfg.shopify.tags.doNotShip);
  return [...new Set(tags)].join(", ");
}

export default async function (ctx) {
  const api = new Fastn({
    connectors: {
      shopify: { orgId: "managed" },
      googleSheets: { orgId: "managed" },
      whatsappBusiness: { orgId: "managed" }
    }
  });
  const cfg = await fastn.config.get(CONFIG_ID);
  const limit = Math.min(Math.max(Number(ctx.input?.limit || 100), 1), 500);
  const phoneNumberId = String(scalar(await fastn.envConfig.get("confirm_karo_whatsapp_phone_number_id")) || "");
  if (!phoneNumberId) throw new Error("WhatsApp phone number id is missing");

  const sheetResult = await api.connector.googleSheets.getValues({ spreadsheetId: cfg.sheets.spreadsheetId, range: cfg.sheets.range });
  const rows = outputOf(sheetResult)?.values || [];
  const now = new Date();
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  const actions = [];

  for (let index = 1; index < rows.length && actions.length < limit; index += 1) {
    const row = Array.from({ length: 13 }, (_, column) => rows[index][column] ?? "");
    if (String(row[0]) !== cfg.merchant.id) continue;
    const orderId = String(row[1] || "");
    const status = String(row[7] || "");
    if (!orderId || !["PENDING", "REMINDER_SENT"].includes(status)) continue;
    const sentAt = new Date(String(row[8] || ""));
    if (Number.isNaN(sentAt.getTime())) { skipped += 1; continue; }
    const ageSeconds = Math.floor((now.getTime() - sentAt.getTime()) / 1000);
    const reminderCount = Number(row[11] || 0);
    let nextStatus = null;

    if (ageSeconds >= cfg.reminders.cutoffAfterSeconds) nextStatus = "EXPIRED";
    else if (status === "PENDING" && ageSeconds >= cfg.reminders.firstAfterSeconds && reminderCount < cfg.reminders.maxReminders) nextStatus = "REMINDER_SENT";
    else { skipped += 1; continue; }

    try {
      if (nextStatus === "REMINDER_SENT") {
        const phone = String(row[4] || "").replace(/\D/g, "");
        if (!phone) throw new Error("Ledger row has no phone");
        const confirmId = `CONFIRM_${cfg.merchant.id}*${orderId}`;
        const cancelId = `CANCEL*${cfg.merchant.id}_${orderId}`;
        const sent = await api.connector.whatsappBusiness.sendInteractiveMessage({
          phoneNumberId,
          to: phone,
          interactive: {
            type: "button",
            body: { text: `Reminder: please confirm ${row[2] || orderId}. We will stop processing it after ${Math.floor(cfg.reminders.cutoffAfterSeconds / 60)} minutes without a reply.` },
            action: { buttons: [
              { type: "reply", reply: { id: confirmId, title: "Confirm Order" } },
              { type: "reply", reply: { id: cancelId, title: "Cancel Order" } }
            ] }
          }
        });
        const messageId = outputOf(sent)?.messages?.[0]?.id;
        if (!messageId) throw new Error("Reminder send returned no message id");
        row[7] = "REMINDER_SENT";
        row[9] = "reminder_sent";
        row[11] = reminderCount + 1;
        actions.push({ orderId, action: "reminder", messageId, ageSeconds });
      } else {
        row[7] = "EXPIRED";
        row[9] = "cutoff_expired";
        actions.push({ orderId, action: "cutoff", ageSeconds });
      }
      row[12] = now.toISOString();
      await api.connector.googleSheets.updateValues({
        spreadsheetId: cfg.sheets.spreadsheetId,
        range: `${cfg.sheets.worksheet}!A${index + 1}:M${index + 1}`,
        valueInputOption: "USER_ENTERED",
        values: [row]
      });
      const orderResult = await api.connector.shopify.list202004Orders({ order_id: orderId, fields: "id,tags,fulfillment_status,cancelled_at" });
      const order = outputOf(orderResult)?.order || {};
      await api.connector.shopify.updateOrderJson({ order_id: orderId, tags: reminderTags(order.tags, cfg, nextStatus) });
      const stateKey = `confirmkaro:v1:${cfg.merchant.id}:order:${orderId}`;
      const previous = await fastn.state.get(stateKey);
      await fastn.state.set(stateKey, { ...(previous || {}), status: nextStatus, rowNumber: index + 1, reminderCount: Number(row[11] || 0), lastUpdated: now.toISOString() });
      updated += 1;
    } catch (error) {
      errors += 1;
      actions.push({ orderId, action: "error", error: String(error?.message || error) });
    }
  }

  return { created: 0, updated, skipped, errors, scanned: Math.max(rows.length - 1, 0), actions };
}
