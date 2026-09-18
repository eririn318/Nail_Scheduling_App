const {google} = require ("googleapis")//googleapis lets your backend communicate with Google services.
const oauth2Client = require("./googleClient")//authentication/Who is allowed to create calendar events
const googleTokenSchema = require("../models/GoogleToken.js")//google tokens (saved in mongoDB first time connect to google account, so reuse them)

// loadCredentials is authentication to login to google calendar
// Get Google's login information from your database and attach it to your OAuth client.
async function loadCredentials(){
    //tokenDoc === Google account's authentication information (the nail technician/business owner's account).
    const tokenDoc = await googleTokenSchema.findOne()//this searches MongoDB GoogleToken collection
// [
//  {
//    access_token: "abc123",
//    refresh_token: "xyz789",
//    expiry_date: 123456789
//  }
// ]

    if(!tokenDoc) throw new Error ("No Google token found.")
    oauth2Client.setCredentials({//Give tokens to OAuth client 
    //oauth2Client(Now your OAuth client has:)
    //   |
    //   |
    //   + access_token
    //   + refresh_token
    //   + expiry date

    access_token: tokenDoc.access_token,
    refresh_token: tokenDoc.refresh_token,
    expiry_date: tokenDoc.expiry_date
})
}

async function createCalendarEvent(booking){
    await loadCredentials()//Make sure Google knows who I am.

    const calendar = google.calendar({version: "v3", auth: oauth2Client})//to talk to Google Calendar API version 3 / I want to use Google Calendar with this authenticated account.

    // build start and end times from booking date + time
    const {DateTime} = require("luxon") //Luxon is a date/time library.
            // JavaScript dates are complicated because of:
            // time zones
            // daylight saving
            // formatting
            // Luxon makes it easier.

    const TIMEZONE = "America/Los_Angeles"

    const start = DateTime.fromFormat(//Luxon, take this text and interpret it as a date/time using this format.( "yyyy-MM-dd h:mm a")
        `${booking.date} ${booking.time}`,
        "yyyy-MM-dd h:mm a",
        {zone: TIMEZONE}
    )
// This converts a string into a real date object.
// Input:
// booking.date="2026-07-10"
// booking.time="2:30 PM"
// Combined:
// 2026-07-10 2:30 PM
// Format:
// yyyy-MM-dd h:mm a
// means:
// yyyy = year
// MM   = month
// dd   = day
// h    = hour
// mm   = minute
// a    = AM/PM
// Result:
// July 10, 2026 2:30 PM Los Angeles

    const end = start.plus({hours:3}) // ★ default appointment length: 3 hour
    const event = {//to build a Google Calendar event--will be display on google calendar
        summary:` 💅 ${booking.clientName} nail appointment`, // ★ shows on your calendar
        description : `
        Services: ${booking.services.map(s=>`${s.name} ($${s.price})`).join(", ")}
        Total: $${booking.totalPrice}
        Status: Confirmed
        `.trim(),
        start: {       
            dateTime: start.toISO(),
            timeZone: TIMEZONE
        },
        end: {
            dateTime: end.toISO(),
            timeZone: TIMEZONE
        }
    }

    const response = await calendar.events.insert({//insert() method inside the events resource provided by Google's library.
        calendarId: "primary",//Use the main calendar of the authenticated Google account.
        requestBody: event// const event 
    })
    return response.data // ★ returns the created event including its Google Calendar event ID //data is data from calendar.events.insert()
}

module.exports = {createCalendarEvent}