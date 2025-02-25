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
    creationDate: {
        type: Date,
        required: true,
        trim: true
    },
    
})