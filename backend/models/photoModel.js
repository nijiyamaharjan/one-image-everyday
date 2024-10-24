const mongoose = require('mongoose')

const Schema = mongoose.Schema

const photoSchema = new Schema({
    photo: {
        type: String
    },
    date: {
        type: Date
    },
    user_id: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Photo', photoSchema)