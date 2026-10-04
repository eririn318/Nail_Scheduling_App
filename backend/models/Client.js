const mongoose = require("mongoose")
const crypto = require("crypto") //is a built-in Node.js module (no install needed) that includes tools for generating secure random values — that's what we use to create her private token.(8f3ac21b9d4e1a02 part of link)

const clientSchema = new mongoose.Schema(
    {
        name: {type: String, required: true}, // client's name
        services: [
            {
                name: {type: String, required: true}, //service name, ex: gel manicure
                price: {type: Number, required: true},

                durationMinutes: {type: Number, required: true}, //total appointment length, set by you
                isMobile: {type: Boolean, default: false}, //whether this client gets a house call
                bufferMinutes: {type: Number, default: 0}, //extra gap time (for mobile travel, or just breathing room between clients)

                serviceId: {
                    type: String,
                    default: () => crypto.randomBytes(4).toString("hex")
                }
            }
        ],
        

        bookingToken: {//will generate automatically, it will show in the postman return and mongoDB database
                  type: String,
            default: () => crypto.randomBytes(8).toString("hex"),
            unique: true, 
        }, 
//default: () => ... means: "if nobody provides a value for this field, automatically run this function instead" what value?
// you never typed anything for bookingToken in that call. That's "nobody provides a value for this field." You only gave name and services.
// Without the default option, Mongoose would just leave bookingToken empty/undefined on that document, since you never supplied one yourself.
// With the default option, Mongoose checks: "did the person creating this document include a bookingToken? No? Then run this function right now, and use whatever it returns as the value instead."
// So "the value" in this case is whatever crypto.randomBytes(8).toString("hex") produces — a random string like 8f3ac21b9d4e1a02. That string is computed fresh, on the spot, the moment the document gets created — and that becomes her bookingToken's actual stored value in the database.
// To put it plainly: you never type her token yourself, anywhere — default is what generates it automatically for you, using the random-string-generating function as the source of that value.


        //crypto.randomBytes(8) generates 8 completely random bytes of data //.toString("hex") converts those random bytes into a readable string of letters/numbers, like 8f3ac21b9d4e1a02
        //unique: true tells MongoDB to reject any attempt to save a second document with a token that already exists — guaranteeing no two clients could ever accidentally share the same private link.
        
        pushSubscription: {// for push notifications when payment confirmed
            type: Object, default: null},
        // type: Object, rather than String like the other fields: because the actual subscription data isn't a simple piece of text — it's a nested structure with multiple parts (endpoint, and a keys object inside that, containing p256dh and auth). Object tells Mongoose: "don't restrict this field's shape strictly — just store whatever object gets put here," since the exact structure comes from the browser's API, not something we're defining ourselves field-by-field.
        
//She opens her booking link
// The browser asks her: "Allow notifications from this site?"
// She taps Allow
// Her browser then generates a unique object — provided automatically by the browser/phone, not something either of us writes — that looks roughly like this:

// This is object (type: Object)
// js {
//      endpoint: "https://fcm.googleapis.com/fcm/send/d8f3a2...",
//      keys: {
//        p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtCJOoRC...",
//        auth: "tBHItJI5svbpez7KI4CCXg=="
//      }
//    }
        // when you confirm her payment, your server reads this saved object back out of her Client document, and uses it to send a notification through a push service — the object tells the system exactly where and how to deliver it, securely, to her specific phone.

        // default: null just means it starts out empty/unset.
        // null simply means "nothing here yet" — once Web Push is built, this is the field that gets filled in the moment she allows notifications.
        },
        {timestamps: true},// automatically adds createdAt and updatedAt fields, tracking when each client record was created/last changed.
)

module.exports = mongoose.model("Client", clientSchema)//usable model named "Client" — this also determines the actual MongoDB collection name (clients, lowercase + plural)