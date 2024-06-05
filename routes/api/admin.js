const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')


// get current users, data 
router.route('/priviledge')
    .put(adminController.grantPriviledge);

// Edith current users data (some fields are not allowed e.g password)
router.route('/barn-user/:id')
    .put(userController.edithInfo);


    
module.exports = router