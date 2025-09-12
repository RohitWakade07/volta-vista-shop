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
    baseUrl: c.base_url || process.env.PHONEPE_BASE_URL || process.env.VITE_PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox",
    clientId: c.client_id || process.env.PHONEPE_CLIENT_ID || "",
    clientSecret: c.client_secret || process.env.PHONEPE_CLIENT_SECRET || "",
    clientVersion: c.client_version || process.env.PHONEPE_CLIENT_VERSION || "",
  };
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

let oauthCache = { token: "", expiresAt: 0 };

async function getOAuthToken(cfg) {
  const now = Date.now();
  if (oauthCache.token && oauthCache.expiresAt - now > 60_000) return oauthCache.token;
  const isSandbox = cfg.baseUrl.includes('/pg-sandbox');
  const tokenUrl = isSandbox
    ? 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token'
    : 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token';
  const params = new URLSearchParams();
  params.set('client_id', cfg.clientId);
  params.set('client_version', cfg.clientVersion);
  params.set('client_secret', cfg.clientSecret);
  params.set('grant_type', 'client_credentials');
  const fetch = (await import('node-fetch')).default;
  const resp = await fetch(tokenUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString()
  });
  const text = await resp.text();
  let json; try { json = JSON.parse(text); } catch { throw new Error(`OAuth non-JSON ${resp.status}`); }
  if (!resp.ok || !json?.access_token) throw new Error(`OAuth failed ${resp.status}: ${text}`);
  const ttlMs = (json.expires_in ? Number(json.expires_in) * 1000 : 55*60*1000);
  oauthCache = { token: json.access_token, expiresAt: now + ttlMs };
  return oauthCache.token;
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
    if (!cfg.clientId || !cfg.clientSecret || !cfg.clientVersion) {
      res.status(500).json({ error: "config-missing-oauth", cfg: { clientId: !!cfg.clientId, clientSecret: !!cfg.clientSecret, clientVersion: !!cfg.clientVersion, baseUrl: cfg.baseUrl } });
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
    const isHermes = cfg.baseUrl.endsWith("/hermes");

    const fetch = (await import("node-fetch")).default;
    const upstreamUrl = `${cfg.baseUrl}${isHermes ? "/pg" : ""}${requestPath}`;
    logger.info("phonepeCreate upstream", { upstreamUrl });
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `O-Bearer ${await getOAuthToken(cfg)}`,
    };
    const resp = await fetch(upstreamUrl, {
      method: "POST",
      headers,
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
    // OAuth-only: no checksum enforcement; trust PhonePe IPs if needed (skipped here)

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
