const mongoose = require("mongoose")
const bookingSchema = new  mongoose.Schema(
    {
    clientName: {type: String, required: true},
    clientToken: {type: String, required: true}, // ★ links back to which client this booking belongs to //This is the actual link back to her Client record — storing her bookingToken here means we can always trace "which client does this booking belong to," by matching this value against a Client's bookingToken. It's how the two collections (clients and bookings) stay connected to each other.
    services: [{name: String, price: Number}], //whichever services she chose for this one appointment 
    totalPrice: {type: Number, required: true},
    date: {type: String, required: true},
    time: {type: String, required: true},
    status: {
        type: String,
        enum:  ["pending", "confirmed", "cancelled"], // enum: an array of allowed values
        default: "pending"
        }, 
    },
    {timestamps: true}// automatically adds createdAt and updatedAt fields, tracking when each client record was created/last changed.
)

module.exports = mongoose.model("Booking", bookingSchema)//usable model named "Booking" — this also determines the actual MongoDB collection name (booking, lowercase + plural)



// Client.js = her profile

// Her name
// Her pre-arranged services and prices (her "cart")
// Her private link token
// Her push notification subscription (once that's built)

// This represents who she is — created once when you first add her, and it stays mostly the same over time (unless you edit her services later).
// Booking.js = one specific appointment

// Which services she picked for that one visit
// The date and time she chose
// The total price for that visit
// Status: pending, confirmed, or cancelled

// This represents one single booking event — and a single client could end up with many Booking documents over time, one for every appointment she ever makes, all pointing back to her via clientToken.
// A simple way to picture the relationship:
// Client: Jane                    (one profile, created once)
//   ├── Booking: Oct 17, 9am      (visit #1)
//   ├── Booking: Nov 3, 2pm       (visit #2)
//   └── Booking: Dec 1, 10am      (visit #3)
// So yes — Client.js is her standing profile, and Booking.js is the record of each individual appointment she books against that profile.
