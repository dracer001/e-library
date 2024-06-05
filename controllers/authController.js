const USER = require('../models/user');
const { checkNull } = require('./dataFilter');
const bcrypt = require('bcrypt');
const { format } = require('date-fns');
const { logEvent } = require('../middleware/logs');

const signupUser = async (req, res) => {
    const required_list = ['firstname', 'lastname', 'password', 'roles', 'email'];

    // Check for null values
    const message = checkNull(required_list, req.body);
    if (message) return res.status(400).json({ "error": message });

    const { firstname, lastname, password, roles, email } = req.body;

    try {
        // dissalow admin role and libarian role
        if(roles.includes("admin")||roles.includes("libarian")) return res.status(400).json({ "error": "cannot grant admin/libarian acess" });

        // Check for duplicate email
        const duplicate = await USER.findOne({ email: email }).exec();
        if (duplicate) return res.sendStatus(409); // Conflict

        // Hash the password
        const hashed_pwd = await bcrypt.hash(password, 10);
        const reg_date = format(new Date(), 'yyyy/MM/dd\tHH:mm:ss');

        // Create the user
        const result = await USER.create({
            firstname,
            lastname,
            email,
            password: hashed_pwd,
            roles,
            registration_date: reg_date
        });

        console.log(result);
        logEvent(`New user registration, userId => ${result.id}`, 'userLog.txt');
        return res.status(201).json({ 'message': `New User @ ${email} created` });
    } catch (err) {
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({ 'error': err.message });
    }
};


const signinUser = async (req, res) => {
    const { email, password } = req.body;
    const required_list = ['email', 'password'];

    // Check for null values
    const message = checkNull(required_list, req.body);
    if (message) return res.status(400).json({ "error": message });

    try {
        // Find the user
        const user = await USER.findOne({ email }).exec();
        if (!user) return res.status(401).json({ "error": 'User not found' });

        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ "error": 'Invalid password' });

        // Set session
        console.log(user._id)
        req.session.userId = user._id;
        logEvent(`User SignIn, userId => ${user.id}`, 'userLog.txt');
        return res.status(200).json({ 'message': 'Login successful' });
    } catch (err) {
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({ 'error': err.message });
    }
};

const signoutUser = (req, res, callback) => {
    logEvent(`User SignOut, userId => ${req.session.userId}`, 'userLog.txt');
    req.session.destroy(err => {
        if (err) {
            if(callback){
                return callback();
            }
            logEvent(err, 'errorLog.txt');
            return res.status(500).json({ 'error': err.message });
        }
    });
    if(callback){
        return callback();
    }else{
        return res.status(200).json({ 'message': 'Signout successful' });

    }
        
};

module.exports = {
    signupUser,
    signinUser,
    signoutUser
};