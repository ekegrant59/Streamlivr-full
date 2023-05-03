const mongoose = require('mongoose')
const mongodb = process.env.MONGODB
mongoose.connect(mongodb)

const blogSchema = new mongoose.Schema({
    title: String,
    date: String,
    summary: String,
    category: String,
    image: String
})

module.exports = mongoose.model('blog', blogSchema)