const googleTokenSchema  = require ("../models/GoogleToken.js")
const oauth2Client = require("../config/googleClient.js")
const {google} = require("googleapis")
const express = require("express")
const {DateTime} = require("luxon")

const router = express.Router()

const BUSINESS_TIMEZONE = "America/Los_Angeles"
const BUSINESS_START_HOUR = 9
const BUSINESS_END_HOUR  = 17
const SLOT_LENGTH_MINUTES = 60

//load your saved token into oauth2Client before any Calendar call
async function loadCredential() {
    const tokenDoc = await googleTokenSchema.findOne()
    if(!tokenDoc){
         throw new Error("No Google token found — connect Calendar first.")
    }
        oauth2Client.setCredentials({
            access_token: tokenDoc.access_token,
            refresh_token: tokenDoc.refresh_token,
            expiry_date: tokenDoc.expiry_date
        })
}

// GET /calendar/busy?start=2026-07-01&end=2026-07-07
router.get("/available", async (req, res) => {
    try{
        await loadCredential()
        const calendar = google.calendar({version: "v3", auth: oauth2Client})
        const {date} = req.query

        // Build "9am Pacific" and "5pm Pacific" for this specific date, correctly
        // it tells Luxon explicitly "interpret this date as Pacific time," and .toUTC() converts it correctly to whatever UTC time that actually corresponds to — including automatically adjusting for daylight saving, which a hardcoded "+7 hours" never could.
        const dayStart = DateTime.fromISO(date, {zone: BUSINESS_TIMEZONE}).set({hour: BUSINESS_START_HOUR, minute:0, second:0})
        const dayEnd = DateTime.fromISO(date, {zone: BUSINESS_TIMEZONE}).set({hour: BUSINESS_END_HOUR, minute:0, second:0})

        const result = await calendar.freebusy.query({//free busy->tell you which time blocks are busy on a calendar,
            requestBody: {
                timeMin: dayStart.toUTC().toISO(),
                timeMax: dayEnd.toUTC().toISO(),
                items: [{id: "primary"}] //"primary" = your main calendar
                }
        })
                const busyBlocks = result.data.calendars.primary.busy.map((b) => ({
                    start: DateTime.fromISO(b.start),
                    end: DateTime.fromISO(b.end)
                })
                )
        // Walk through the day in fixed-length slots, skipping any that overlap a busy block
                const openSlots = []
                let cursor = dayStart
                console.log("DEBUG dayStart:", dayStart.toISO(), "valid?", dayStart.isValid, "reason:", dayStart.invalidReason)

                while (cursor.plus({minutes: SLOT_LENGTH_MINUTES}) <= dayEnd){
                    const slotEnd = cursor.plus({minutes:SLOT_LENGTH_MINUTES}) //.plus() is a method that adds time (or another duration) to a date/time object.ex "2026-06-26T09:00" ->  2026-06-26T09:30:00
                    const overlaps =  busyBlocks.some(b => cursor < b.end && slotEnd > b.start) //The slot starts before the busy block ends AND the slot ends after the busy block starts. If both are true, the two time ranges overlap.
                    if(!overlaps){
                        openSlots.push(cursor.toFormat("h:mm a")) // e.g. "9:30 AM"
                    }
                cursor = slotEnd 
                // cursor = 9:00
                // slotEnd = 9:30

                // cursor = slotEnd

                // cursor = 9:30
                // slotEnd = 10:00

                // cursor = slotEnd

                // cursor = 10:00
                // slotEnd = 10:30
                }
                res.json({date, openSlots}) //You're using {} because res.json() only accepts one single thing, and you have two separate pieces of data (date, and openSlots) that both need to go back to the browser together
// GET /api/availability?date=2026-06-27 -> {date} = req.query.date = "2026-06-27"
// {
//   "date": "2026-06-27",
//   "openSlots": [
//     "9:00 AM",
//     "9:30 AM",
//     "11:00 AM",
//     "11:30 AM"
//   ]
// }

    }catch(err){
        console.error("calendar busy, check error: ", err)
       res.status(500).json({error: err.message})

    }
})

module.exports = router