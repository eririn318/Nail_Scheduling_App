require ('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const loadCredential= require("./routes/calendar.js")
const clientRoutes = require("./routes/clients.js") 
const bookingRoutes = require("./routes/bookings.js")
const paymentRoutes = require("./routes/payments.js")
const notifyRoutes = require("./routes/notify.js")
const webPushRoutes = require("./routes/webpush.js")
const app = express()
const authRoutes = require("./routes/auth.js")
const adminAuth = require("./middleware/adminAuth.js")


app.use(cors())
app.use(express.json())

// protected routes — require admin password
app.use("/clients", adminAuth, clientRoutes) //client routes
app.use("/payments", adminAuth, paymentRoutes) //payment routes
app.use("/bookings/pending", adminAuth) //booking/pending routes
app.use("/bookings/confirmed", adminAuth) //booking/confirmed routes

// public routes — no password needed - stays open for clients
app.use("/bookings", bookingRoutes) //booking routes
app.use("/calendar", loadCredential) //calendar routes
app.use("/auth", authRoutes) //google routes
app.use("/notify", notifyRoutes) //notify routes
app.use("/webpush", webPushRoutes) //webpush routes


mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch((err) => console.error("Mongo error: ", err))

app.get("/", (req, res) => res.json({ok: true}))//backend server route (will display {"ok":true} in browser// key: "ok",  value: true

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))