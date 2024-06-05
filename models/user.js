const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        enum: ['user', 'author', 'libarian', 'admin'],
        default: ['user']
    },
    last_login: {
        type: Date
    },
    last_logout: {
        type: Date
    },
    registration_date: {
        type: Date,
        default: Date.now
    },
    barn: {
        type: Boolean,
        default: false
    },
    barn_duration:{
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
