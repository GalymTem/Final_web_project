const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    creationDate: {
        type: Date,
        required: true,
        trim: true
    },
    updateDate: {
        type: Date,
        required: true,
        trim: true
    },
    deletionDate: {
        type: Date,
        required: true,
        trim: true
    },
    adminStatus: {
        type: Boolean,
        required: true,
        trim: true
    }
})

const usersModel = mongoose.model("users", schema)
module.exports = usersModel