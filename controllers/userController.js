const USER = require('../models/user');
const {dissalowKey, checkNull} = require('./dataFilter');
const { logEvent } = require('../middleware/logs');
const bcrypt = require('bcrypt');
const { signoutUser } = require('./authController');

const getInfo = async(req, res) => {
    const unauthorizedKey = ["password", "registration_date", "_id"]
    // Ensure `req.user` is a plain JavaScript object
    let user = req.user.toObject ? req.user.toObject() : req.user;
    unauthorizedKey.forEach(key => {
        delete user[key];
    });
    return res.status(200).json(user);
}


const edithInfo = async (req, res) => {
    const new_info = req.body;
    let user = req.user;
    const unauthorizedKey = ["password", "registration_date", "_id", "id"]
    const message = dissalowKey(unauthorizedKey, new_info);
    if (message) return res.status(400).json({ "error": message });
    // dissalow admin role and libarian role
    if(new_info?.roles && (new_info?.roles.includes("admin")||new_info?.roles.includes("libarian"))) return res.status(400).json({ "error": "cannot grant admin/libarian acess" });

    let updateFields = [];
    for (let key in new_info) {
        console.log(key);
        if (user[key] !==undefined) {
            user[key] = new_info[key];
            updateFields.push(key);
        }
    }
    try {
        await USER.findByIdAndUpdate(user.id, user, {
            runValidators: true // Validate the updates against the schema
        });
        logEvent(`user data updated, userId => ${user.id}, fields => ${updateFields}`, 'userLog.txt');
        return res.status(200).json({"message": `update successful, \n fields=>${updateFields}`}); // Send the updated user document as the response
    } catch (err) {
        return res.status(500).json({ "error": err.message});
    }
};


const changePassword = async (req, res)=>{
    const message = checkNull(['old_password', 'new_password'], req.body);
    if(message) return res.status(400).json({"error": message});
    const {old_password, new_password} = req.body
    // Compare the password
    const match = await bcrypt.compare(old_password, req.user.password);
    if (!match) return res.status(401).json({ "error": 'Invalid password' });
    // Hash the password
    const hashed_pwd = await bcrypt.hash(new_password, 10);
    try{
        await USER.findByIdAndUpdate(req.user.id, {"password":hashed_pwd});
        logEvent(`user password updated, userId => ${req.user.id}`, 'userLog.txt');
        signoutUser(req, res, () => {
            return res.status(200).json({"message": `password update successful !`});
        });
    } catch (err) {
        return res.status(500).json({ "error": err.message });
    }
}
module.exports = {
    getInfo,
    edithInfo,
    changePassword
};
