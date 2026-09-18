function adminAuth(req, res, next){
    const password= req.headers["x-admin-password"] //x-admin-password is key in header in postman (header's tab), x-admin-password: password here -> key is x-admin-password: value is password
    // x-admin-password is a custom header key in Postman
    // Key: x-admin-password   Value: yourpasswordhere (from .env ADMIN_PASSWORD)
    // req.headers["x-admin-password"] reads that value from the incoming request

    if (!password || password !== process.env.ADMIN_PASSWORD) 
    return res.status(401).json({error: "Invalid password"})
     // ★ wrong password → stop here, send 401, request never reaches the route

    next() // password correct — let the request through to the route
    // ★ correct password → keep going, pass request to the actual route handler

}

module.exports = adminAuth

// next() is an Express function that means "I'm done here, pass the request to the next handler in line."
// In middleware specifically, every function receives three arguments (req, res, next)instead of the usual two:(req, res)


// req (request) — everything that came in from Postman:
// req.body     → the JSON you typed in Postman's Body tab
// req.headers  → the headers you added in Postman's Headers tab (including x-admin-password)
// req.params   → anything in the URL like :bookingId, :token
// req.query    → anything after ? in the URL like ?date=2026-10-17
// res (response) — what gets sent back to Postman:
// res.json({...})      → sends JSON back, shows in Postman's response Body tab
// res.status(401)      → sets the status code shown in Postman (200, 401, 404, 500 etc.)
// Visual flow:
// Postman                    Your Server                   Postman
// ────────                   ──────────                    ────────
// Headers  ─────────────→   req.headers                   
// Body     ─────────────→   req.body        →  route runs
// URL      ─────────────→   req.params                    ←───  res.json()  response Body
// ?query   ─────────────→   req.query                     ←───  res.status() status code
// So yes — req is everything coming in from Postman, and res is everything going out back to Postman. Same pattern in every single route and middleware you've written — nothing changes about that fundamental flow.

// http://localhost:4000/bookings/6a4727c8b6de7d9f59b87128/reschedule?date=2026-10-17
//  ──────────────────────────           ────────────────
//    req.params.bookingId                req.query.date
//    = "6a4727c8b6de7d9f59b87128"        = "2026-10-17" 



// req.params — values embedded inside the URL path, defined with : in your route:
// router.patch("/:bookingId/reschedule", ...)
//                 ↑ defined here with :
// URL: /bookings/6a4727.../reschedule

// req.params.bookingId = "6a4727..."
// req.query — values after the ? in the URL:
// /calendar/available?date=2026-10-17&start=9am

// req.query.date  = "2026-10-17"
// req.query.start = "9am"


// req.params.token — in /clients/booking/:token
// req.params.bookingId — in /payments/:bookingId/confirm
// req.query.date — in /calendar/available?date=2026-10-17
// req.query.start — in /calendar/busy?start=2026-06-24
