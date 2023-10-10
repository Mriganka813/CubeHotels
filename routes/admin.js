const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admincontrollers');


router.get('/',adminController.adminhome)
router.get('/rooms',adminController.rooms)
router.post('/addroom',adminController.addrooms)

module.exports = router; 