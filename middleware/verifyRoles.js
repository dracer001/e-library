const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRoles = req.user.roles;

        // Check if user has at least one of the allowed roles
        const allowed = allowedRoles.some(role => userRoles.includes(role));
        
        if (!allowed) {
            return res.sendStatus(403); // Forbidden
        }

        next(); // User has the necessary role, proceed to next middleware or route handler
    };
};

module.exports = verifyRoles