const CONFIG_ID = "cfg_814c42766561";

function outputOf(result) {
  return result && Object.prototype.hasOwnProperty.call(result, "output") ? result.output : result;
}

function firstMessage(input) {
  if (input?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) return input.entry[0].changes[0].value.messages[0];
  if (input?.messages?.[0]) return input.messages[0];
  if (input?.message) return input.message;
  return input || {};
}

function buttonIdFrom(input) {
  const message = firstMessage(input);
  return message?.button?.payload ||
    message?.interactive?.button_reply?.id ||
    input?.button?.payload ||
    input?.interactive?.button_reply?.id ||
    null;
}

function parseButtonId(id, merchantId) {
  const confirmPrefix = `CONFIRM_${merchantId}*`;
  const cancelPrefix = `CANCEL*${merchantId}_`;
  if (String(id).startsWith(confirmPrefix)) return { decision: "CONFIRMED", orderId: String(id).slice(confirmPrefix.length) };
  if (String(id).startsWith(cancelPrefix)) return { decision: "CANCELLED", orderId: String(id).slice(cancelPrefix.length) };
  return null;
}

function tagsFrom(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return list.map((tag) => String(tag).trim()).filter(Boolean);
}

function finalTags(existing, cfg, decision) {
  const managed = Object.values(cfg.shopify.tags);
  const tags = tagsFrom(existing).filter((tag) => !managed.includes(tag));
  if (decision === "CONFIRMED") tags.push(cfg.shopify.tags.confirmed);
  if (decision === "CANCELLED") tags.push(cfg.shopify.tags.cancelled, cfg.shopify.tags.doNotShip);
  return [...new Set(tags)].join(", ");
}

export default async function (ctx) {
  const api = new Fastn({
    connectors: {
      shopify: { orgId: "managed" },
      googleSheets: { orgId: "managed" }
    }
  });
  const cfg = await fastn.config.get(CONFIG_ID);
  const buttonId = buttonIdFrom(ctx.input);
  if (!buttonId) return { created: 0, updated: 0, skipped: 1, errors: 0, reason: "not_a_button_reply" };

  const parsed = parseButtonId(buttonId, cfg.merchant.id);
  if (!parsed || !parsed.orderId) {
    return { created: 0, updated: 0, skipped: 1, errors: 0, reason: "invalid_or_foreign_button_id", buttonId };
  }

  const { decision, orderId } = parsed;
  const stateKey = `confirmkaro:v1:${cfg.merchant.id}:order:${orderId}`;
  const previous = await fastn.state.get(stateKey);
  if (previous && ["CONFIRMED", "CANCELLED"].includes(previous.status)) {
    return { created: 0, updated: 0, skipped: 1, errors: 0, reason: "duplicate_reply", status: previous.status, orderId, buttonId };
  }

  const sheetResult = await api.connector.googleSheets.getValues({ spreadsheetId: cfg.sheets.spreadsheetId, range: cfg.sheets.range });
  const rows = outputOf(sheetResult)?.values || [];
  const rowIndex = rows.findIndex((row, index) => index > 0 && String(row[0]) === cfg.merchant.id && String(row[1]) === orderId);
  if (rowIndex < 0) {
    return { created: 0, updated: 0, skipped: 0, errors: 1, reason: "order_not_found_in_ledger", orderId, buttonId };
  }
  const rowNumber = rowIndex + 1;
  const currentStatus = String(rows[rowIndex][7] || "");
  if (["CONFIRMED", "CANCELLED"].includes(currentStatus)) {
    await fastn.state.set(stateKey, { ...(previous || {}), status: currentStatus, rowNumber, replied: true });
    return { created: 0, updated: 0, skipped: 1, errors: 0, reason: "duplicate_ledger_reply", status: currentStatus, orderId, buttonId, rowNumber };
  }

  const now = new Date().toISOString();
  const nextRow = Array.from({ length: 13 }, (_, index) => rows[rowIndex][index] ?? "");
  nextRow[7] = decision;
  nextRow[9] = decision === "CONFIRMED" ? "confirm" : "cancel";
  nextRow[10] = now;
  nextRow[12] = now;
  await api.connector.googleSheets.updateValues({
    spreadsheetId: cfg.sheets.spreadsheetId,
    range: `${cfg.sheets.worksheet}!A${rowNumber}:M${rowNumber}`,
    valueInputOption: "USER_ENTERED",
    values: [nextRow]
  });

  const orderResult = await api.connector.shopify.list202004Orders({ order_id: orderId, fields: "id,tags,fulfillment_status,cancelled_at" });
  const order = outputOf(orderResult)?.order || {};
  const tags = finalTags(order.tags, cfg, decision);
  await api.connector.shopify.updateOrderJson({ order_id: orderId, tags });
  await fastn.state.set(stateKey, {
    ...(previous || {}),
    status: decision,
    rowNumber,
    replied: true,
    replyAt: now,
    replyButtonId: buttonId
  });

  return {
    created: 0,
    updated: 1,
    skipped: 0,
    errors: 0,
    orderId,
    status: decision,
    buttonId,
    rowNumber,
    safetyAction: "tags_only",
    autoCancelled: false,
    autoFulfilled: false
  };
}
