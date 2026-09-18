const express = require("express")
const oauth2Client = require("../config/googleClient")
const googleTokenSchema = require("../models/GoogleToken")
const { modelNames } = require("mongoose")


const router = express.Router();

const SCOPES = ["https://www.googleapis.com/auth/calendar"]


//step A: send you to Google's consent screen(login screen)
router.get("/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline", // ★ needed so Google gives us a refresh_token
        scope: SCOPES,
        prompt: "consent",// ★ forces refresh_token to be sent again, useful while testing
    })
    // res.json(url)   // ← this just displays the URL as text
    res.redirect(url) //tells the browser "stop loading this page, go load this other URL instead"
})

//step B: Google sends you back here with a temporary code
router.get("/google/callback", async(req, res) => {
    const  {code} = req.query
// This is object destructuring — a shortcut for pulling one specific property out of an object. It's exactly equivalent to writing: const code = req.query.code;

// pulls the code value out of the URL's query string — the part after the ?.
// when Google redirects you back, the URL looks like:
// localhost:4000/auth/google/callback?code=4/0Adeu5BW3x9k2...&scope=...
// Everything after the ? is query parameters — key-value pairs separated by &. Express automatically parses all of that into an object called req.query:
// req.query = {
//   code: "4/0Adeu5BW3x9k2...",
//   scope: "https://www.googleapis.com/auth/calendar"
// }

// { } aren't creating a new object here — they're telling JavaScript "look inside req.query and grab the property named code, then make it available as its own variable called code

    try{
        // This is object destructuring — a shortcut for pulling one specific property out of an object. It's exactly equivalent to writing: const code = req.query.code;

        // you've got the temporary authorization code Google sent, ready to hand to:
        // {} means just pulling tokens out of whatever oauth2Client.getToken() returns.
        const {tokens} = await oauth2Client.getToken(code)

        // Only one calendar will ever connect to this app (yours) — so just keep one record
        await googleTokenSchema.deleteMany({})
        await googleTokenSchema.create(tokens)

        res.send("Google Calender connected! You can close the tab.")
    }catch(err){
        console.error("OAuth callback error", err)
        res.status(500).send("Something went wrong connecting Google calender")
    }
})

module.exports = router