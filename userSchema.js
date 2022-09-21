const mongoose = require('mongoose')
const mongodb = process.env.MONGODB
mongoose.connect(mongodb)

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    category: String
})

module.exports = mongoose.model('waitlist', userSchema)