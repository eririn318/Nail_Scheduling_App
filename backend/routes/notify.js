const express = require("express")
const router = express.Router()

// helper function — sends a Telegram message to your phone

async function sendTelegramNotification(booking) {
        const message = `
        💅 New Payment Submitted!
        Client: ${booking.clientName}
        Services: ${booking.services.map(s=> `${s.name} ($${s.price})`).join(", ")}                   
        Total: $${booking.totalPrice}
        Date: ${booking.date}
        Time: ${booking.time}

    Check payments and confirm in your dashboard.
`
// .map() walks through each service and formats it as "gel manicure ($90)"
// .join(", ") combines them all into one string: "gel manicure ($90), gel pedicure ($105)" 

//server talking to Telegram
//fetch sends a POST request to Telegram's servers
const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
const response = await fetch(url, {
    method: "POST",
    headers: {"Content-Type": "application/json"},//tells telegram "I'm sending data, converted to JSON string"
    body: JSON.stringify({//send it to Telegram with the required field names
        chat_id: process.env.TELEGRAM_CHAT_ID,//find chat by chatID
        text: message 
        //const message = `
        // 💅 New Payment Submitted!
        // Client: ${booking.clientName}
        // Services: ${booking.services.map(s=> `${s.name} ($${s.price})`).join(", ")}        
        // Total: $${booking.totalPrice}
        // Date: ${booking.date}
        // Time: ${booking.time}
    })
})

const data = await response.json()
if(!data.ok) {
    throw new Error(`Telegram error: ${data.description}`)//reads that error message straight from Telegram's response
}

}

// POST /notify/payment-submitted
// called automatically when client taps "I've sent payment"
router.post("/payment-submitted", async (req, res) => {
    try{
        const {booking} = req.body //req.body is the actual data sent in this specific HTTP request, use this data in sendNotification(booking)
            // req.body = {
            //     "booking": {"clientName": "Eriko",
            //     "services": [{"name": "gel manicure", "price":"90"}],
            //     "totalPrice": 260,
            //     "date": "2026-10-17",
            //     "time": "9:00 AM"}
            // }
        // destructure → pulls out the booking object
        
        await sendTelegramNotification(booking)
        res.json({ok: true}) //{ok: true} means successfully message sent to email//is basically just a thumbs up signal — "email sent, all good, move on."
    }catch(err){
        console.error("Telegram notification error: ", err)
        res.status(500).json({error: err.message})
    }
})
module.exports = router