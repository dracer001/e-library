require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); // Express library
const mongoose = require('mongoose'); // MongoDB driver
const dbConn = require('./config/dbConn'); // Database connection
const sessionStart = require('./config/session');
const {logEvent, logger} = require('./middleware/logs');
const verifyUser = require('./middleware/authUser');
const app = express(); // Initialize Express app

// Connect to the database

dbConn();

// Middleware setup (uncomment if logging middleware is needed)
app.use(express.urlencoded({ extended: true })); //parasing body form

app.use(express.json()); // Middleware to parse JSON bodies

app.use(logger); //add to log, all request made, path, origin date etc 
app.use(sessionStart);


// Routes
app.get('/', (req, res) => {
    console.log("Attempted to load hello.html");
    res.send('HELLO WORLD');
});

app.use('/super', require('./routes/api/superUser'));
app.use('/auth', require('./routes/auth/auth')); // Authentication routes

app.use(verifyUser)
app.use('/user', require('./routes/api/users'));
app.use('/library', require('./routes/api/library'));










// Default port is 3500
const PORT = process.env.PORT || 3500;

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    // Uncomment and modify the following line if request logging is needed
    // app.use((req, res, next) => {
    //     logEvent(`${req.url} \t ${req.method}`, 'reqlog.txt');
    //     next();
    // });
});
