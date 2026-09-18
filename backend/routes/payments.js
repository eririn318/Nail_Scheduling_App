const express = require("express")
const Booking = require("../models/Booking.js")
const router = express.Router()
const {createCalendarEvent} = require("../config/googleCalendar.js")

// OWNER: confirm payment received → flip booking from pending to confirmed
// PATCH / payments/: bookingId/confirm
router.patch("/:bookingId/confirm", async(req, res) => {
    try{
        const booking = await Booking.findByIdAndUpdate(
            req.params.bookingId, //finds the booking by its MongoDB _id            
            {status: "confirmed"}, //flips status from pending to confirmed
              { returnDocument: 'after' }//==={new: true}==={ returnDocument: 'after' }=>(just newer syntax) //returns updated document
        )//"show me the document after the change was applied"/show me the result after/show confirmed

        //status404 = incorrect URL, URL is moved or deleted etc
        if(!booking) return res.status(404).json({error: "Booking not found."})
        
        //automatically write to Google Calendar after confirming
        await createCalendarEvent(booking)
        // send Web Push notification to client after confirming
        await fetch(`http://localhost:4000/webpsh/send/${booking.clientToken}`, {
            method: "POST",
            headers: {"Content-Type":  "application/json"},
            body: JSON.stringify({
                title: "Appointment Confirmed",
                body: `Your ${booking.date} at ${booking.time} appointment is confirmed. See you then!`
            })
        })
        res.json(booking)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

//OWNER: cancel a booking
// PATCH /payments/:bookingId/cancel
router.patch("/:bookingId/cancel", async(req, res) => {
    try{
    const booking = await Booking.findByIdAndUpdate(
    req.params.bookingId,
    {status: "cancelled"},
    { returnDocument: 'after' }//==={new: true}
    )
    if(!booking) return res.status(404).json({error: " Booking not found."})
        res.json(booking)
}catch(err){
    res.status(500).json({message: err.message})
}
})
module.exports = router //exports payment confirmation routes

// payments.js                          server.js
// ─────────────────────────────        ──────────────────────────────
// const router = express.Router()  
// router.patch("/confirm", ...)    →   const paymentRoutes = require("./routes/payments.js")
// router.patch("/cancel", ...)     →   app.use("/payments", paymentRoutes)
// module.exports = router          →   (receives both routes, mounts them under /payments)