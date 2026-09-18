const express = require("express");
const webpush = require("web-push");
const Client = require("../models/Client.js");
const router = express("router");

// configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

//GET /webpush/vapid-public-key
// client-facing: frontend needs this to subscribe to push notifications
router.get("/vapid-public-key", async (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

//POST /webpush/send/:token
//OWNER: send a push notification to a specific client
router.post("/send/:token", async (req, res) => {
  try {
    // 1. read token from URL
    // req.params.token = "1488a8160c399394"
    // 2. find client in MongoDB whose bookingToken matches
    const client = await Client.findOne({ bookingToken: req.params.token }); // → find the client in MongoDB using her token from the URL
    // = Client.findOne({ bookingToken: "1488a8160c399394" })
    // finds the client whose bookingToken matches that value
    // 3. if no client found → stop, send error
    if (!client) return res.status(404).json({ error: "Client not found." }); // client doesn't exist at all //404 not found
    // 4. if client found but never allowed notifications → stop, send error
    if (!client.pushSubscription)
      return res
        .status(400) //400-bad request
        .json({ error: "Client has no push subscription.." }); // client exists but never allowed notifications

    const { title, body } = req.body;
    // 5. if client found AND has push subscription → send notification to her phone
    const payload = JSON.stringify({ title, body }); //title + body as a JSON string

    await webpush.sendNotification(client.pushSubscription, payload); // → send notification TO her device (using her saved address) WITH the title/body content
    // 6. respond success

    res.json({ ok: true });
  } catch (err) {
    console.lot("Web Push error: ", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// client.pushSubscription = the address (where to send) — her device's endpoint + encryption keys, saved in MongoDB
// payload = the content (what to send) — the JSON string containing title and body

// pushSubscription is saved in mongoDB
// Once the frontend is built and she allows notifications, that whole object gets saved into MongoDB inside her client document:
// json{
//   "_id": "6a46fb9e1f80bde61b7fcc79",
//   "name": "Eriko",
//   "services": [...],
//   "bookingToken": "1488a8160c399394",
//   "pushSubscription": {
//     "endpoint": "https://fcm.googleapis.com/fcm/send/d8f3a2...",
//     "keys": {
//       "p256dh": "BNcRdreALR...",
//       "auth": "tBHItJ..."
//     }
//   },
//   "createdAt": "2026-07-03T..."
// }

// client.pushSubscription reads that whole object back out of MongoDB and passes it to webpush.sendNotification() as the delivery address.

// "endpoint": "https://fcm.googleapis.com/fcm/send/d8f3a2...",  ← delivery address (identifies her DEVICE)
