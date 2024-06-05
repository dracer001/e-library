const express = require('express')
const router = express.Router()
const superController = require('../../controllers/superController')

router.route('/setup')
    .post(superController.setupSuper);

router.route('/login')
    .post(superController.loginSuper);

router.route('/logout')
    .post(superController.logoutSuper);

router.route('/auth-admin/:id')
    .post(superController.authAdmin);

module.exports = router;