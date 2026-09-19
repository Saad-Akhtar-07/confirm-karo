const CONFIG_ID = "cfg_814c42766561";

function outputOf(result) {
  return result && Object.prototype.hasOwnProperty.call(result, "output") ? result.output : result;
}

function scalar(value) {
  if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "value")) return value.value;
  return value;
}

function normalizePhone(raw) {
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

function tagsFrom(value) {
  const list = Array.isArray(value) ? value : String(value || "").split(",");
  return list.map((tag) => String(tag).trim()).filter(Boolean);
}

function setStatusTags(existing, cfg, status) {
  const managed = Object.values(cfg.shopify.tags);
  const tags = tagsFrom(existing).filter((tag) => !managed.includes(tag));
  if (status === "PENDING") tags.push(cfg.shopify.tags.pending);
  if (status === "UNVERIFIED") tags.push(cfg.shopify.tags.unverified, cfg.shopify.tags.doNotShip);
  return [...new Set(tags)].join(", ");
}

function extractOrder(input) {
  if (input && input.order) return input.order;
  if (input && input.body && input.body.order) return input.body.order;
  if (input && input.body && input.body.id) return input.body;
  return input || {};
}

async function readLedger(api, cfg) {
  const result = await api.connector.googleSheets.getValues({
    spreadsheetId: cfg.sheets.spreadsheetId,
    range: cfg.sheets.range
  });
  return outputOf(result)?.values || [];
}

async function writeLedger(api, cfg, values, rowNumber) {
  if (rowNumber) {
    return api.connector.googleSheets.updateValues({
      spreadsheetId: cfg.sheets.spreadsheetId,
      range: `${cfg.sheets.worksheet}!A${rowNumber}:M${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      values: [values]
    });
  }
  return api.connector.googleSheets.appendValues({
    spreadsheetId: cfg.sheets.spreadsheetId,
    range: cfg.sheets.range,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    values: [values]
  });
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
  const order = extractOrder(ctx.input);
  const orderId = String(order.id || "");
  if (!orderId) throw new Error("Shopify order id is required");

  const gateways = (order.payment_gateway_names || []).map((v) => String(v).trim().toLowerCase());
  const isCod = gateways.some((gateway) => cfg.shopify.codGatewayNames.includes(gateway));
  if (!isCod) {
    return { created: 0, updated: 0, skipped: 1, errors: 0, orderId, reason: "not_cod" };
  }

  const merchantId = cfg.merchant.id;
  const stateKey = `confirmkaro:v1:${merchantId}:order:${orderId}`;
  const previous = await fastn.state.get(stateKey);
  if (previous && previous.confirmationSent) {
    return { created: 0, updated: 0, skipped: 1, errors: 0, orderId, status: previous.status, reason: "duplicate_state" };
  }

  const rows = await readLedger(api, cfg);
  const rowIndex = rows.findIndex((row, index) => index > 0 && String(row[0]) === merchantId && String(row[1]) === orderId);
  const existingRowNumber = rowIndex >= 0 ? rowIndex + 1 : null;
  if (existingRowNumber && ["PENDING", "CONFIRMED", "CANCELLED", "REMINDER_SENT"].includes(String(rows[rowIndex][7]))) {
    await fastn.state.set(stateKey, { confirmationSent: true, status: rows[rowIndex][7], rowNumber: existingRowNumber });
    return { created: 0, updated: 0, skipped: 1, errors: 0, orderId, status: rows[rowIndex][7], reason: "duplicate_ledger", rowNumber: existingRowNumber };
  }

  const customer = order.customer || {};
  const address = order.shipping_address || order.billing_address || customer.default_address || {};
  const noteAttributes = Object.fromEntries((order.note_attributes || []).map((item) => [String(item.name || item.key || ""), item.value]));
  const customerName = [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    [address.first_name, address.last_name].filter(Boolean).join(" ") ||
    String(noteAttributes.confirmkaro_customer_name || "Customer");
  const phone = normalizePhone(order.phone || address.phone || customer.phone || customer.default_address?.phone || noteAttributes.confirmkaro_phone);
  const orderName = String(order.name || `#${order.order_number || orderId}`);
  const total = `${order.currency || "PKR"} ${order.total_price || order.current_total_price || "0"}`;
  const city = String(address.city || noteAttributes.confirmkaro_city || "");
  const now = new Date().toISOString();

  if (!phone) {
    const values = [merchantId, orderId, orderName, customerName, "", total, city, "UNVERIFIED", "", "missing_phone", "", 0, now];
    await writeLedger(api, cfg, values, existingRowNumber);
    const tags = setStatusTags(order.tags, cfg, "UNVERIFIED");
    await api.connector.shopify.updateOrderJson({ order_id: orderId, tags });
    await fastn.state.set(stateKey, { confirmationSent: false, status: "UNVERIFIED", rowNumber: existingRowNumber });
    return { created: existingRowNumber ? 0 : 1, updated: existingRowNumber ? 1 : 0, skipped: 0, errors: 0, orderId, status: "UNVERIFIED", reason: "missing_phone", rowNumber: existingRowNumber };
  }

  const confirmId = `CONFIRM_${merchantId}*${orderId}`;
  const cancelId = `CANCEL*${merchantId}_${orderId}`;
  const phoneNumberId = String(scalar(await fastn.envConfig.get("confirm_karo_whatsapp_phone_number_id")) || "");
  const wabaId = String(scalar(await fastn.envConfig.get("confirm_karo_whatsapp_waba_id")) || "");
  if (!phoneNumberId || !wabaId) throw new Error("WhatsApp environment configuration is missing");

  let messageMode = "interactive";
  let sendResult;
  const templateResult = await api.connector.whatsappBusiness.listMessageTemplates({ wabaId });
  const templates = outputOf(templateResult)?.data || [];
  const template = templates.find((item) => item.name === cfg.whatsapp.templateName && item.language === cfg.whatsapp.templateLanguage);
  if (template && String(template.status).toUpperCase() === "APPROVED") {
    messageMode = "template";
    sendResult = await api.connector.whatsappBusiness.sendTemplateMessage({
      phoneNumberId,
      to: phone,
      templateName: cfg.whatsapp.templateName,
      languageCode: cfg.whatsapp.templateLanguage,
      components: [
        { type: "body", parameters: [
          { type: "text", text: customerName },
          { type: "text", text: orderName },
          { type: "text", text: cfg.merchant.displayName },
          { type: "text", text: total },
          { type: "text", text: city || "your city" }
        ] },
        { type: "button", sub_type: "quick_reply", index: "0", parameters: [{ type: "payload", payload: confirmId }] },
        { type: "button", sub_type: "quick_reply", index: "1", parameters: [{ type: "payload", payload: cancelId }] }
      ]
    });
  } else {
    sendResult = await api.connector.whatsappBusiness.sendInteractiveMessage({
      phoneNumberId,
      to: phone,
      interactive: {
        type: "button",
        body: { text: `Hi ${customerName}, confirm ${orderName} from ${cfg.merchant.displayName} for ${total} to ${city || "your city"}.` },
        action: { buttons: [
          { type: "reply", reply: { id: confirmId, title: "Confirm Order" } },
          { type: "reply", reply: { id: cancelId, title: "Cancel Order" } }
        ] }
      }
    });
  }

  const sendOutput = outputOf(sendResult) || {};
  const messageId = sendOutput.messages?.[0]?.id || null;
  if (!messageId) throw new Error("WhatsApp did not return a message id");
  const values = [merchantId, orderId, orderName, customerName, phone, total, city, "PENDING", now, "", "", 0, now];
  await writeLedger(api, cfg, values, existingRowNumber);
  const tags = setStatusTags(order.tags, cfg, "PENDING");
  await api.connector.shopify.updateOrderJson({ order_id: orderId, tags });
  await fastn.state.set(stateKey, { confirmationSent: true, status: "PENDING", rowNumber: existingRowNumber, messageId, sentAt: now, reminderCount: 0 });

  return {
    created: existingRowNumber ? 0 : 1,
    updated: existingRowNumber ? 1 : 0,
    skipped: 0,
    errors: 0,
    orderId,
    status: "PENDING",
    messageId,
    messageMode,
    confirmId,
    cancelId,
    rowNumber: existingRowNumber
  };
}
