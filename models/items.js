const mongoose = require('mongoose')
const schema = new mongoose.Schema({
    itemId: {
        type: Number,
        required: true,
        trim: true
    }  ,
    url1: {
        type: String,
        required: true,
        trim: true
    },
    url2: {
        type: String,
        required: true,
        trim: true
    },
    url3: {
        type: String,
        required: true,
        trim: true
    },
    name_ru: {
        type: String,
        required: true,
        trim: true
    },
    name_en: {
        type: String,
        required: true,
        trim: true
    },
    desc_ru: {
        type: String,
        required: true,
        trim: true
    },
    desc_en: {
        type: String,
        required: true,
        trim: true
    }
})

const itemsModel = mongoose.model("items", schema)

module.exports = itemsModel