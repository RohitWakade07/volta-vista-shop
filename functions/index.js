/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions, config} = require("firebase-functions");
const {onCall, onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
try { admin.initializeApp(); } catch (e) {}

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.getUserCount = onCall(async (request) => {
  const superAdminEmail = "ultron.inov@gmail.com";
  const auth = request.auth;
  if (!auth || auth.token.email !== superAdminEmail) {
    return { error: "permission-denied" };
  }
  let nextPageToken = undefined;
  let count = 0;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    count += result.users.length;
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  return { count };
});

// PhonePe payments: create and webhook handlers
const crypto = require("crypto");

function getConfig() {
  let runtime = {};
  try {
    if (config && typeof config === 'function') {
      runtime = config();
    }
  } catch (_) {
    runtime = {};
  }
  const c = runtime && runtime.phonepe ? runtime.phonepe : {};
  return {
    merchantId: c.merchant_id || process.env.PHONEPE_MERCHANT_ID || process.env.VITE_PHONEPE_MERCHANT_ID || "",
    saltKey: c.salt_key || process.env.PHONEPE_SALT_KEY || process.env.VITE_PHONEPE_SALT_KEY || "",
    saltIndex: String(c.salt_index || process.env.PHONEPE_SALT_INDEX || process.env.VITE_PHONEPE_SALT_INDEX || "1"),
    baseUrl: c.base_url || process.env.PHONEPE_BASE_URL || process.env.VITE_PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox",
  };
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

exports.phonepeCreate = onRequest({ cors: [/\.*/] }, async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method-not-allowed" });
    return;
  }
  try {
    logger.info("phonepeCreate start", { headers: req.headers, raw: typeof req.rawBody === 'string' ? req.rawBody : undefined });
    const { orderId, amountPaise, userId, mobileNumber, redirectBaseUrl } = req.body || {};
    logger.info("phonepeCreate body", { orderId, amountPaise, userId, hasMobile: !!mobileNumber, redirectBaseUrl });
    if (!orderId || !amountPaise || !userId || !redirectBaseUrl) {
      res.status(400).json({ error: "invalid-request", message: "Missing required fields", got: req.body || null });
      return;
    }

    const cfg = getConfig();
    if (!cfg.merchantId || !cfg.saltKey || !cfg.saltIndex) {
      res.status(500).json({ error: "config-missing", cfg: { merchantId: !!cfg.merchantId, saltKey: !!cfg.saltKey, saltIndex: !!cfg.saltIndex, baseUrl: cfg.baseUrl } });
      return;
    }

    const payload = {
      merchantId: cfg.merchantId,
      merchantTransactionId: orderId,
      amount: Number(amountPaise),
      merchantUserId: userId,
      mobileNumber: mobileNumber || undefined,
      redirectUrl: `${redirectBaseUrl}/payment/success?orderId=${orderId}`,
      callbackUrl: `${redirectBaseUrl}/payment/success?orderId=${orderId}`,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const jsonPayload = JSON.stringify(payload);
    logger.info("phonepeCreate payload", { payload });
    const base64Payload = Buffer.from(jsonPayload).toString("base64");
    // Build URL and checksum paths correctly for prod (/pg) vs sandbox (/pg-sandbox)
    const requestPath = "/v1/pay";
    const segment = (cfg.baseUrl.endsWith("/pg")) ? "/pg" : "/pg-sandbox";
    const checksumPath = `${segment}${requestPath}`;
    const checksum = `${sha256Hex(base64Payload + checksumPath + cfg.saltKey)}###${cfg.saltIndex}`;

    const fetch = (await import("node-fetch")).default;
    const upstreamUrl = `${cfg.baseUrl}${requestPath}`;
    logger.info("phonepeCreate upstream", { upstreamUrl });
    const resp = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": cfg.merchantId,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const text = await resp.text();
    logger.info("phonepeCreate upstream resp", { status: resp.status, text: text.slice(0, 500) });
    let json;
    try { json = JSON.parse(text); } catch {
      logger.error("PhonePe create non-JSON response", { status: resp.status, text, upstreamUrl });
      res.status(502).json({ error: "bad-gateway", details: text, upstreamUrl });
      return;
    }
    if (!resp.ok || !json?.success) {
      logger.error("PhonePe create failed", { status: resp.status, json, upstreamUrl });
      res.status(502).json({ ...json, status: resp.status, upstreamUrl });
      return;
    }

    const url = json?.data?.instrumentResponse?.redirectInfo?.url;
    if (!url) {
      res.status(502).json({ error: "invalid-response" });
      return;
    }

    res.status(200).json({ url });
  } catch (e) {
    logger.error("phonepeCreate error", { message: e?.message, stack: e?.stack });
    res.status(500).json({ error: "internal", message: e?.message });
  }
});

exports.phonepeWebhook = onRequest({ cors: [/\.*/] }, async (req, res) => {
  if (req.method === "GET" || req.method === "HEAD") {
    res.status(200).send("OK");
    return;
  }
  if (req.method !== "POST") {
    res.status(200).send("OK"); // Graceful for unexpected verbs
    return;
  }
  try {
    const cfg = getConfig();
    const xVerify = req.get("x-verify") || req.get("X-VERIFY");
    const xMerchant = req.get("x-merchant-id") || req.get("X-MERCHANT-ID");
    const rawBody = JSON.stringify(req.body || {});

    // Validate signature
    const notifyRequestPath = "/v1/notification";
    const segment = (cfg.baseUrl.endsWith("/pg")) ? "/pg" : "/pg-sandbox";
    const notifyChecksumPath = `${segment}${notifyRequestPath}`;
    const expected = `${sha256Hex(Buffer.from(rawBody).toString("base64") + notifyChecksumPath + cfg.saltKey)}###${cfg.saltIndex}`;
    if (!xVerify || xVerify !== expected) {
      logger.warn("Invalid webhook signature", { xVerify, expected });
      // Still respond 200 as per many gateways to avoid retries when misconfigured, but do nothing
      res.status(200).json({ received: true });
      return;
    }
    if (xMerchant && cfg.merchantId && xMerchant !== cfg.merchantId) {
      logger.warn("Merchant mismatch", { xMerchant });
      res.status(200).json({ received: true });
      return;
    }

    const body = req.body || {};
    const data = body && body.data ? body.data : body;
    const transactionId = data?.merchantTransactionId || data?.transactionId;
    const code = data?.code || data?.responseCode || "";
    const success = code === "PAYMENT_SUCCESS" || code === "SUCCESS" || data?.state === "COMPLETED";

    if (transactionId) {
      try {
        const db = admin.firestore();
        const orderRef = db.collection("orders").doc(String(transactionId));
        const update = success
          ? { paymentStatus: "completed", status: "processing", updatedAt: admin.firestore.FieldValue.serverTimestamp() }
          : { paymentStatus: "failed", status: "cancelled", updatedAt: admin.firestore.FieldValue.serverTimestamp() };
        await orderRef.set(update, { merge: true });
      } catch (e) {
        logger.error("Failed to update order from webhook", e);
      }
    }

    res.status(200).json({ received: true });
  } catch (e) {
    logger.error("phonepeWebhook error", e);
    // Still 200 to avoid repeated retries storms
    res.status(200).json({ received: true });
  }
});
