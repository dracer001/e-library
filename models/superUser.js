const mongoose = require('mongoose');
const { Schema } = mongoose;

const superuserSchema = new Schema({
    username: {
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
    last_login: {
        type: Date
    },
    last_logout: {
        type: Date
    },
    registration_date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('superUser', superuserSchema);
