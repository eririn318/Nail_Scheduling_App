const express = require("express")
const Booking = require("../models/Booking.js")
const Client = require("../models/Client.js")
const router = express.Router()

// CLIENT: submit a booking (checkout)
// POST /bookings
router.post("/", async(req, res) => {
    try{
        const {clientToken, services, date, time} = req.body // ★ destructure clientToken, services, totalPrice, date, time}

        // step 1: find the client by their token — confirms this is a real client
        const client = await Client.findOne({bookingToken: clientToken})
        if(!client) return res.status(400).json({error: "Invalid booking link."})

        // step 2: calculate total price by adding up whichever services they picked
        const totalPrice = services.reduce((sum, s) => sum + s.price, 0) 
               // reduce walks through the services array, adding each price to a running total
               // e.g. [{ price: 85 }, { price: 45 }] → 0 + 85 + 45 = 130

                // services — the array of service objects she picked
                // .reduce(...) — walks through that array one item at a time
                // (sum, s) — two parameters: sum is the running total so far, s is the current item being looked at
                // sum + s.price — adds the current item's price to the running total
                // 0 — the starting value of sum (starts at zero, before any prices are added)

         // step 3: save the booking
         const booking = await Booking.create({
            clientName: client.name, // ★ pulled from her Client record, not typed by her
            clientToken,
            services,
            totalPrice,
            date,
            time,
            status: "pending"
         })
         res.json(booking)
    }catch(err){
        res.status(500).json({error: err.message})
    }

})

// OWNER: get all pending bookings (payment list in your dashboard)
// GET /bookings/pending
router.get("/pending", async(req, res) => {
    try{
        const bookings = await Booking.find({status: "pending"}).sort({createdAt: 1}) // sort by createdAt: 1 means oldest first — first submitted, first confirmed
        res.json(bookings)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// OWNER: get all confirmed bookings
// GET /bookings/confirmed
router.get("/confirmed", async(req, res) => {
    try{
        const bookings = await Booking.find({status: "confirmed"}).sort({date:1}) // sort by date: 1 means earliest appointment first
        res.json(bookings)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// CLIENT: get all bookings for one specific client by their token
// GET /bookings/client/:token
router.get("/client/:token", async(req, res) => {
    try{
        const bookings = await Booking.find({clientToken: req.params.token}).sort({date:1})
        res.json(bookings)
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

//CLIENT: cancel a booking (only allowed if > 48 hours away)
//PATCH /bookings/:bookingId/cancel
router.patch("/:bookingId/cancel", async(req, res)=>{
    try{
    const booking = await Booking.findById(req.params.bookingId)
    if(!booking) return res.status(404).json({error: "Booking not found"})

    //check if appointment is less than 48hours away
    const appointmentDateTime = new Date(`${booking.date} ${booking.time}`)
    const now = new Date()
    const hoursUntilAppointment = (appointmentDateTime - now) / (1000*60*60)         // ★ (appointmentDateTime - now) gives milliseconds difference
        // ★ divide by (1000 * 60 * 60) converts milliseconds → hours

        if(hoursUntilAppointment < 48) {
            return res.status(403).json({
                error: "Cannot cancel within 48 hours of the appointment. Please contact Eriko directly."
        })
    }
        const updated = await Booking.findByIdAndUpdate(
            req.params.bookingId,
            {status: "cancelled"},
            {returnDocument: "after"}
        )
        res.json(updated)
        
          }catch(err){
            res.status(500).json({error: err.message})
        }
        })

        //CLIENT: reschedule a booking (only allowed if > 48 hours away)
        //PATCH: /bookings/:bookingId/reschedule
        router.patch("/:bookingId/reschedule", async(req, res)=>{
            try{
                // const booking = await Booking.findByIdAndUpdate(req.params.bookingId)
                const booking = await Booking.findById(req.params.bookingId) // ★ fixed: was findByIdAndUpdate with no update object, so it silently did nothing. This line's only job here is to FETCH the booking so we can check the 48-hour window — the actual update happens later in the function with the real findByIdAndUpdate call.
                if(!booking) return res.status(404).json({error: "Booking not found"})

                //48 hours check
                const appointmentDateTime = new Date(`${booking.date} ${booking.time}`)
                const now = new Date()
                const hoursUntilAppointment = (appointmentDateTime-now) / (1000*60*60)

                if(hoursUntilAppointment < 48) {
                    return res.status(403).json({error: "Can not reschedule within 48 hours of the appointment. Please contact Eriko directly."})
                }
                 
                //update to new date/time
                const {newDate, newTime} = req.body // variables pulled from req.body
                // Postman body:          req.body:              database update:
                // {                  →   newDate = "2026-11-01"  →  date: "2026-11-01"
                //  date: "2026-11-01"
                // "newDate":             newTime = "10:00 AM"   →  time: "10:00 AM"
                //     "2026-11-01",
                // time: "10:00 AM"
                //.    "2026-11-01",
                // "newTime": 
                //     "10:00 AM"    
                // called newDate in the request      
                
                const updated = await Booking.findByIdAndUpdate(
                    req.params.bookingId,
                    {date: newDate, time: newTime}, //body contains new date and time
                    {returnDocument: "after"} // "return the document to the updated data".-> new time & date.  option FOR Mongoose, controls database return. sends the updated booking back to the caller.
                )
                res.json(updated)
            }catch(err){
                res.status(500).json({error: err.message})
            }
        })

   
module.exports = router