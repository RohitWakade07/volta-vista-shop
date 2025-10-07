/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall, onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
try { admin.initializeApp(); } catch (e) {}
const Razorpay = require('razorpay');
const crypto = require('crypto');

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

// --- Razorpay Setup ---
function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return new Razorpay({ key_id, key_secret });
}

// Create Razorpay order
exports.razorpayCreateOrder = onRequest({ cors: ["*"], maxInstances: 10, secrets: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });
  try {
    const { orderId, amount, currency = 'INR', receipt } = req.body || {};
    if (!orderId || !amount) return res.status(400).json({ error: 'missing-fields' });

    const rzp = getRazorpay();
    const rzpOrder = await rzp.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency,
      receipt: receipt || orderId,
      notes: { orderId }
    });

    // Persist gateway order id on Firestore order
    await admin.firestore().collection('orders').doc(orderId).set({
      gateway: 'razorpay',
      gatewayOrderId: rzpOrder.id,
      paymentStatus: 'pending',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return res.json({ order: rzpOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('razorpayCreateOrder error', err);
    return res.status(500).json({ error: 'internal', message: err.message });
  }
});

// Verify Razorpay signature from client callback
exports.razorpayVerify = onRequest({ cors: ["*"], maxInstances: 10, secrets: ["RAZORPAY_KEY_SECRET"] }, async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'missing-fields' });
    }
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto.createHmac('sha256', key_secret).update(payload).digest('hex');
    const verified = expected === razorpay_signature;

    const orderRef = admin.firestore().collection('orders').doc(orderId);
    if (verified) {
      await orderRef.set({
        paymentStatus: 'completed',
        status: 'processing',
        transactionId: razorpay_payment_id,
        gatewayOrderId: razorpay_order_id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      await admin.firestore().collection('payments').add({
        orderId,
        amount: admin.firestore.FieldValue.increment(0), // optional; client stores actual total on order
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'completed',
        transactionId: razorpay_payment_id,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await orderRef.set({
        paymentStatus: 'failed',
        status: 'pending',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    return res.json({ verified });
  } catch (err) {
    console.error('razorpayVerify error', err);
    return res.status(500).json({ error: 'internal', message: err.message });
  }
});

// Razorpay Webhook for server-side source of truth
exports.razorpayWebhook = onRequest({ cors: ["*"], maxInstances: 10, secrets: ["RAZORPAY_WEBHOOK_SECRET"] }, async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const body = JSON.stringify(req.body);
    if (!secret || !signature) return res.status(400).send('missing-signature');
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
    if (expected !== signature) return res.status(401).send('invalid-signature');

    const event = req.body;
    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      const payment = event.payload.payment.entity;
      const rzpOrderId = payment.order_id;
      // Find order by gatewayOrderId
      const snap = await admin.firestore().collection('orders').where('gatewayOrderId', '==', rzpOrderId).limit(1).get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        await doc.ref.set({
          paymentStatus: 'completed',
          status: 'processing',
          transactionId: payment.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
        await admin.firestore().collection('payments').add({
          orderId: doc.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          paymentMethod: 'razorpay',
          status: 'completed',
          transactionId: payment.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
    return res.send('ok');
  } catch (err) {
    console.error('razorpayWebhook error', err);
    return res.status(500).send('internal');
  }
});