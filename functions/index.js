/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onCall} = require("firebase-functions/v2/https");
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