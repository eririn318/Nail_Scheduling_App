const express = require("express")
const Client = require("../models/Client.js")
const router = express.Router()

//OWNER GET ALL CLIENTS (admin only)
//GET /clients
router.get("/", async (req, res) =>{
    try{
        const clients = await(Client.find({}).sort({createdAt: -1}))
        res.json(clients)
    }
    catch(err){
        res.status(500).json({error: err.message})
    }
})

// find() is a Mongoose method that searches the clients collection in MongoDB
// {} means "no filter" — give me all documents, not just ones matching specific criteria
// Compare to Client.findOne({ bookingToken: token }) which filters by a specific token — here {} means no filter at all, return everything

// .sort({ createdAt: -1 })

// Sorts the results before returning them
// createdAt — the timestamp field automatically added by { timestamps: true } in your schema
// -1 means descending order — newest first (most recently created client at the top)
// 1 would mean ascending — oldest first

// So -1 vs 1:
// createdAt: -1  →  newest client first  (Jul 13, Jul 10, Jul 3, ...)
// createdAt: 1   →  oldest client first  (Jul 3, Jul 10, Jul 13, ...)
// await

// Waits for MongoDB to finish searching and sorting before moving to the next line
// Without await, clients would be a Promise (unfinished task), not real data

// const clients =

// Stores the result — an array of all client documents — in the variable clients

// Full step by step:

// Go to MongoDB clients collection
// Find all documents (no filter)
// Sort them newest first
// Wait for that to finish
// Store the result array in clients
// Send it back: res.json(clients)

// What gets returned — an array of full client objects:
//   {
//     "name": "Eriko",
//     "services": [...],
//     "bookingToken": "1488a8160c399394",
//     "pushSubscription": null,
//     "createdAt": "2026-07-13T..."   ← newest, shows first
//   },

// OWNER: create a new client with their name, services, and prices
// POST /clients






// OWNER: create a new client with their name, services, and prices
// POST /clients
router.post("/", async (req, res) => {
    try{
        const {name, services} = req.body // ★ destructure name and services from the request body(req.body is the incoming data from whoever is making the request (you, the owner, sending a POST request to create a new client))
        const client = await Client.create({name, services})
        res.json(client)// ★ returns the full client record including the auto-generated bookingToken
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// CLIENT-FACING: look up a client by their private token
// GET /clients/booking/:token
router.get("/booking/:token", async (req, res) => {
    try{
        const client = await Client.findOne({bookingToken:req.params.token}) // token is from booking/:token
        if (!client) return res.status(404).json({error: "Invalid booking link."})
            res.json({
                name: client.name,
                services: client.services // ★ only her own services — no other client data ever sent
            })
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

// OWNER: save her push subscription for Web Push notifications
// POST /clients/:token/subscription
router.post("/:token/subscription", async (req, res) => {
    try{
        const {subscription} = req.body 
        // subscription come from frontend=> body: JSON.stringify({ subscription: subscriptionObject })
        // pulls out the value stored under the key named "subscription"
        // subscription = { endpoint: "...", keys: {...} }
        const client = await Client.findOneAndUpdate(
            {bookingToken: req.params.token},  // step 1: FIND — which document to update? ★ find her by token
            {pushSubscription: subscription},  // step 2: UPDATE — what to change? ★ save the subscription object
            {new: true}// return the updated document, not the old one
        )
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

module.exports = router
