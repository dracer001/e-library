const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const librarySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: [String], // Array of strings
        default: []
    },
    summary: {
        type: String,
        default: ''
    },
    publisher: {
        type: String,
        required: true
    },
    version: {
        type: [String],
        enum: ['eBook', 'Hard Copy'],
        required: true
    },
    availability: {
        type: [String],
        enum: ['loan', 'sale', 'N/A', 'free'],
        required: true
    },
    sale_price: {
        type: Number,
        default: 0
    },
    loan_price: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    published_date: {
        type: Date,
        default: Date.now
    },
    upload_date: {
        type: Date,
        default: Date.now
    },
    file_data: {
        type: Buffer,
        default: null
    },
    file_mimetype: {
        type: String,
        default: null
    },
    image_data: {
        type: Buffer,
        default: null // Store the image data as binary
    },
    image_mimetype: {
        type: String,
        default: null // Store the MIME type of the image file
    },
    uploader_id: {
        type: mongoose.Schema.Types.ObjectId, // Use ObjectId to reference user
        ref: 'User', // Assuming you have a User model
        required: true
    },
    barn: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Library', librarySchema);
