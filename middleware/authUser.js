const User = require('../models/user'); // Import your User model

async function verifyUser(req, res, next) {
    if (req.session && req.session.userId) {
        try {
            // Fetch user data from the database
            const user = await User.findById(req.session.userId);
            if (user) {
                // Attach user data to the req object
                req.user = user;
                return next();
            } else {
                // User not found, send an unauthorized response
                return res.status(401).json({ message: 'Unauthorized: User not found' });
            }
        } catch (error) {
            // Handle potential errors
            return res.status(500).json({ message: error });
        }
    } else {
        // User is not authenticated, send an unauthorized response
        return res.status(401).json({ message: 'Unauthorized: You need to log in to access this resource.' });
    }
}

module.exports = verifyUser;
