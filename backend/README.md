# Nail Booking App — Project Plan

This app is a custom, zero-fee nail booking gatekeeper that connects directly to your Google Calendar to display real-time availability. It enforces a strict payment-first policy, automatically blocking last-minute cancellations within 48 hours and routing clients to pay via Venmo or Zelle before confirming. Best of all, it protects client privacy by instantly handing checkout confirmation over to their phone's native text messaging app, keeping sensitive contact details entirely out of the online database.


## Backend folder structure

```
backend/
├── server.js                  # starts the server, connects everything together
├── .env                        # secrets — never shared, never committed to GitHub
├── config/
│   └── googleClient.js        # holds your Google OAuth client setup
├── models/
│   ├── GoogleToken.js          # ✅ done — stores your Calendar access token
│   ├── Client.js                # 📝 update needed — name, private token, services/prices,
│   │                            #   browser push subscription (for Web Push notifications)
│   └── Booking.js               # 📝 update needed — date, time, services, total,
│                                #   status: 'pending' | 'confirmed' | 'cancelled'
└── routes/
    ├── auth.js                  # ✅ done — Google OAuth login + callback
    ├── calendar.js               # ✅ done — real busy/open slot calculation (9am–5pm)
    ├── clients.js                 # 📝 written — create client, look up by token
    ├── bookings.js                 # 📝 update needed — checkout + 48-hr cancel/reschedule validation
    ├── payments.js                 # ⏳ planned — confirm pending → confirmed + triggers Web Push to client
    └── notify.js                    # ⏳ planned — Telegram alert to Eriko when client submits payment
```

---

## Frontend folder structure (Step 5)

```
frontend/
├── public/
│   └── sw.js                       # ⏳ planned — Service Worker for background Web Push banners
├── src/
│   ├── pages/
│   │   ├── Home.jsx                # plain landing page, nothing client-specific
│   │   ├── ClientBooking.jsx        # her private link page — auto-loads everything, she types nothing:
│   │   │                            #   - Name + services/price shown automatically from her token
│   │   │                            #   - Real open-slot picker (from your Google Calendar)
│   │   │                            #   - Venmo deep-link button + Zelle instructions
│   │   │                            #   - Dual-Action Submit: saves booking to database AND opens
│   │   │                            #     her native Messages app with pre-filled text:
│   │   │                            #     "Hi Eriko! This is [Name]. I just submitted a booking
│   │   │                            #      request for my nails!"
│   │   │                            #   - Success screen: "Thank you! Your request has been submitted.
│   │   │                            #     You will get a notification the second Eriko approves it."
│   │   │                            #   - 48-hour logic: shows [Reschedule]/[Cancel] if > 48hrs away;
│   │   │                            #     hides them and shows "Contact Eriko" if inside 48hrs
│   │   │                            #   - [Chat with Eriko] button — opens native SMS to your number,
│   │   │                            #     digits never shown on screen
│   │   ├── AdminLogin.jsx            # password entry, you only (env-var based, single shared password)
│   │   └── AdminDashboard.jsx         # your full control panel:
│   │                                  #   - Add Client form (name, services, prices → generates private link)
│   │                                  #   - Client list with copy-link buttons
│   │                                  #   - Pending payment queue (confirm button triggers Web Push to client)
│   │                                  #   - Confirmed appointments view
│   └── App.jsx                        # routes everything above together
```

---

## Full feature checklist

**Backend — done & tested**
- [x] Server + MongoDB connection
- [x] Real Google OAuth + Calendar token storage
- [x] Real free/busy + open-slot calculation (9am–5pm, your actual calendar)

**Backend — written, needs updates & testing**
- [ ] Client model — add browser push subscription field for Web Push
- [ ] Booking model — add status: 'pending' | 'confirmed' | 'cancelled'
- [ ] Create-client route
- [ ] Look-up-by-token route (client-facing, private link)
- [ ] Checkout/submit-booking route

**Backend — planned, not built**
- [ ] Confirm-payment endpoint (flips booking from pending → confirmed)
- [ ] Web Push notification dispatcher — fires to her phone the moment you hit confirm
- [ ] 48-hour validation — blocks cancel/reschedule if appointment is < 48hrs away
- [ ] Auto-write confirmed bookings into your real Google Calendar
- [ ] Admin password protection (env-var based, single shared password)
- [ ] Telegram bot notification — pings Eriko instantly when client submits payment

**Frontend — planned, not built**
- [ ] Client booking page (ClientBooking.jsx):
  - [ ] Name + services auto-loaded from her private link — she types nothing
  - [ ] Real open-slot picker (pulled from your calendar)
  - [ ] Venmo deep-link button + Zelle instructions
  - [ ] Dual-Action Submit button:
        → saves booking to database
        → opens her native Messages app with pre-filled text to Eriko
  - [ ] Success screen with message: "Thank you! Your request has been submitted.
        You will get a notification the second Eriko approves it."
  - [ ] Web Push permission prompt (first visit only — guides her to allow notifications)
  - [ ] 48-hour logic block: hides Cancel/Reschedule inside 48hrs, shows Chat button instead
  - [ ] [Chat with Eriko] button — opens native SMS, your number hidden from screen
- [ ] Admin login page (AdminLogin.jsx)
- [ ] Admin dashboard (AdminDashboard.jsx):
  - [ ] Add Client form → instantly generates private booking link
  - [ ] Client list with [Copy Link] buttons
  - [ ] Pending payment queue with [Confirm] button (triggers Web Push to client)
  - [ ] Confirmed appointments list
- [ ] Cute, warm visual design:
      soft cream background, serif headings, stamp-style confirmation mark,
      warm red/gold Japanese-inspired palette

---

## Notification plan (fully settled)

| Event | Who gets notified | How |
|---|---|---|
| Client submits payment | **Eriko** | Telegram ping (free) |
| Client submits payment | **Client** | Success screen on app (always works) + pre-filled text opens to Eriko |
| Eriko confirms payment | **Client** | Web Push banner on her phone (free, requires home screen + permission) |

**Web Push honest notes:**
- Only works if she added the app to her home screen AND allowed notifications
- On iPhone, requires Safari + home screen install first
- Built-in one-time visual setup guide on first visit
- If she skips it: everything still works, she just won't get the banner
- Eriko's personal text to her is always the reliable backup

---

## Privacy decisions (settled)

- [x] Private link per client (token-based) — chosen over phone login, for celebrity-client privacy
- [x] Client phone numbers never stored in the database — native SMS handoff keeps them out entirely
- [x] No phone number visible anywhere on screen — [Chat with Eriko] button hides the digits
- [x] No client name or info in the URL — link is just a random token (e.g. /book/8f3ac21b9d4e1a02)
- [x] Page title stays generic (just business name) — nothing in browser history identifies the client
- [x] HTTPS on deployment (Vercel/Render) — encrypts the link in transit automatically

---

## Monetization notes (future consideration)

- Existing competitors charge $24–165/month (Vagaro, GlossGenius, StyleSeat, Square)
- Your edge: no card processing fees (Venmo/Zelle), and privacy-first design rare in this market
- To sell to other nail artists: needs multi-tenant rebuild (each business gets their own account)
- Easiest first step: sell as a one-time custom setup for other independent artists (freelance dev work)
- Build for yourself first — prove it works before deciding whether to productize

---

## Suggested build order

1. Update Client + Booking models (add push subscription field, update status enum)
2. Test all written-but-untested routes (clients, bookings)
3. Confirm-payment endpoint
4. Telegram notification
5. 48-hour cancel/reschedule validation
6. Auto-write confirmed bookings to Google Calendar
7. Admin password protection
8. Web Push Service Worker + notification dispatcher
9. Frontend: Admin login + Add Client form (so you can create real clients without curl)
10. Frontend: Client booking page (full flow)
11. Frontend: Admin dashboard (full control panel)
12. Deploy backend to Render, frontend to Vercel