const session = require('express-session'); //GET SESSION LIBRARY
const MongoStore = require('connect-mongo');
// Set up session config

const session_config = (session({
    secret: process.env.DATABASE_URI,
    resave: false, // Forces the session to be saved back to the store
    saveUninitialized: true, // Forces a session that is "uninitialized" to be saved to the store
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URI }),
    // cookie: {
    //     maxAge: 1000 * 60 * 60 * 24,   // 1 day
    //     secure: true,   // Ensures cookies are only sent over HTTPS
    //     httpOnly: true, // Prevents client-side JavaScript access to the cookie
    //     sameSite: 'strict' // Cookies are sent only on first-party context
    // }
}));

module.exports = session_config