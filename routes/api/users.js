const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')




// get current users, data 
router.route('/')
    .get(userController.getInfo);

// Edith current users data (some fields are not allowed e.g password)
router.route('/edith')
    .put(userController.edithInfo);

// change passowrd
router.route('/password-change')
    .put(userController.changePassword);

    
module.exports = router