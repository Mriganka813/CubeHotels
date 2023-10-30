const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superadminControllers');

router.post('/create-account',superAdminController.createAdmin)

router.get('/login-page',superAdminController.renderLogin)
router.post('/login',superAdminController.loginAdmin)


module.exports = router; 