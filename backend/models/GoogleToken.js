const mongoose = require("mongoose")

const googleTokenSchema = new mongoose.Schema({
    access_token:String,
    refresh_token:String,
    scope:String,
    token_type: String,
    expiry_date: Number
},
{timestamps: true}
//createdAt: Date  // set once, when the document is first saved
//updatedAt: Date  // updated every time the document is saved again
)

module.exports = mongoose.model("GoogleToken", googleTokenSchema)
// "GoogleToken", automatically lowercases it and makes it plural, and that becomes your actual collection name in the database: googletokens in MongoDB database
