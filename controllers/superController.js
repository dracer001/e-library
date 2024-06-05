const {checkNull} = require('./dataFilter');
const superUser = require('../models/superUser');
const bcrypt = require('bcrypt');
const { format } = require('date-fns');
const { logEvent } = require('../middleware/logs');
const USER = require('../models/user');


const setupSuper = async (req, res) =>{
    console.log("Setting superuser");
    const required_list = ['username','password', 'email'];

    // Check for null values
    const message = checkNull(required_list, req.body);
    if (message) return res.status(400).json({ "error": message });
    const {username, email, password} = req.body;

    try{

        // Check for duplicate email
        const duplicate = await superUser.find();
        if (duplicate.length>0) return res.status(409).json({"error": "super User already set"});
        // Hash the password
        const hashed_pwd = await bcrypt.hash(password, 10);
        const reg_date = format(new Date(), 'yyyy/MM/dd\tHH:mm:ss');

        // Create the user
        const result = await superUser.create({
            username,
            email,
            password: hashed_pwd,
            registration_date: reg_date
        });
        logEvent(`superUser set up, superId => ${result.id}`, 'userLog.txt');
        return res.status(201).json({ 'message': `super User set complete` });
    } catch (err) {
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({ 'error': err.message });
    }
}


const loginSuper = async (req, res) => {
    const required_list = ['username', 'password'];

    // Check for null values
    const message = checkNull(required_list, req.body);
    if (message) return res.status(400).json({ "error": message });
    const { username, password } = req.body;

    try {
        // Find the user
        const user = await superUser.findOne({ username }).exec();
        if (!user) return res.status(401).json({ "error": 'invalid username' });

        // Compare the password
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ "error": 'Invalid password' });

        // Set session
        req.session.userId = user._id;
        await superUser.findByIdAndUpdate(user.id, {"last_login":format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')});
        logEvent(`superUser logIn, userId => ${user.id}`, 'userLog.txt');
        return res.status(200).json({ 'message': 'Login successful' });
    } catch (err) {
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({ 'error': err.message });
    }
}

const logoutSuper = async (req, res, callback) =>{
    try{
        userId = user.id;
        logEvent(`superUser SignOut, userId => ${req.session.userId}`, 'userLog.txt');
        req.session.destroy(err => {
            if (err) {
                if(callback){
                    return callback();
                }
                logEvent(err, 'errorLog.txt');
                return res.status(500).json({ 'error': err.message });
            }
        });
        await superUser.findByIdAndUpdate(userId, {"last_logout":format(new Date(), 'yyyy/MM/dd\tHH:mm:ss')});
        if(callback){
            return callback();
        }else{
            return res.status(200).json({ 'message': 'Signout successful' });

        }
    } catch(err){
        console.log(err);
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({error: err});
    }           
}

const authAdmin = async (req, res)=>{
    try{
        user_id = req.params.userid;
        const {roles} = req.body;
        await USER.findByIdAndUpdate(user_id, {"roles": roles});
        logEvent(`admin auth given to, userId => ${user_id}`, 'userLog.txt');
        return res.status(200).json({"message":"admin auth successful"});
    } catch (err){
        console.log(err);
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({error: err});
    }
}

const getAllUsers = async(req, res) =>{
    try{
        const users = await USER.find();
        logEvent(`req to get all users by userId => ${req.user.id}`, 'userLog.txt');
        return res.status(200).json(users);
    } catch (err){
        console.log(err);
        logEvent(err, 'errorLog.txt');
        return res.status(500).json({error: err});
    }
}

module.exports = {
    setupSuper,
    loginSuper,
    logoutSuper,
    authAdmin,
    getAllUsers
}