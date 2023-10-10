const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homecontrollers');
const {isAuthenticatedUser}=require('../config/auth')

// Home Page
router.get('/', isAuthenticatedUser, homeController.home);
// Add Rooms
router.get('/addrooms',isAuthenticatedUser,homeController.renderAddRoom)
router.get('/add-guest/:roomId',isAuthenticatedUser,homeController.addGuest)

router.post('/book-room/:roomNum',isAuthenticatedUser,homeController.addGuestData)
router.get('/bookings',isAuthenticatedUser,homeController.renderBookings)
router.post('/push-room',isAuthenticatedUser,homeController.addRoom)

router.get('/room-dash',isAuthenticatedUser,homeController.renderRoomDash)

router.get('/select/:roomName',isAuthenticatedUser,homeController.select)
router.get('/checkoutpage/:id',isAuthenticatedUser,homeController.checkoutPage)

router.post('/proceed/:id',isAuthenticatedUser,homeController.checkout)
router.get('/checkinbookings',isAuthenticatedUser,homeController.renderCheckInBookings)

router.get('/reports',homeController.reportPage)

router.post('/generate-report',isAuthenticatedUser,homeController.getReport2)

router.use('/admin',require('./admin'))


router.get('/sample',isAuthenticatedUser,homeController.sample)


router.use('/user',require('./user'))



module.exports = router; 