const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homecontrollers');
const {isAuthenticatedUser}=require('../config/auth')

// Home Page
router.get('/', isAuthenticatedUser, homeController.home);
// Add Rooms
router.get('/addrooms',isAuthenticatedUser,homeController.renderAddRoom)
router.get('/add-guest/:roomId',isAuthenticatedUser,homeController.addGuest)
router.get('/addrooms-cat/:roomTypeId',isAuthenticatedUser,homeController.addRoomCat)

router.post('/book-room/:roomId',isAuthenticatedUser,homeController.addGuestData)
router.get('/bookings',isAuthenticatedUser,homeController.renderBookings)

router.get('/recent-bookings',isAuthenticatedUser,homeController.recentBookings)
router.post('/recent-bookings/search',isAuthenticatedUser,homeController.recentBookingSearch)
router.post('/push-room',isAuthenticatedUser,homeController.addRoom)

router.get('/room-dash',isAuthenticatedUser,homeController.renderRoomDash)

router.get('/select/:roomName',isAuthenticatedUser,homeController.select)
router.get('/checkoutpage/:id',isAuthenticatedUser,homeController.checkoutPage)

router.post('/proceed/:guestId',isAuthenticatedUser,homeController.proceedCheckout)

router.get('/checkinbookings',isAuthenticatedUser,homeController.renderCheckInBookings)
router.post('/checkin-bookings/search',isAuthenticatedUser,homeController.renderCheckInBookingSearch)

router.get('/reports',isAuthenticatedUser,homeController.reportPage)

router.post('/generate-report',isAuthenticatedUser,homeController.getReport)



router.get('/sample',isAuthenticatedUser,homeController.sample)

router.get('/del/room/:roomId',isAuthenticatedUser,homeController.deleteRoom)

router.get('/get/invoices/:guestId',homeController.getInvoice)

router.get('/edit/:guestId',isAuthenticatedUser,homeController.editbookings)

router.post('/update/:guestId',isAuthenticatedUser,homeController.updatebookings)

router.get('/error',async(req,res)=>{
    return res.render('errorPage',{
        title: 'ERROR'
    })
})

router.get('/checkout-new',async(req,res)=>{
    return res.render('checkoutPage',{
        title:'Checkout '
    })
})

// router.get('/print/bill/:invoiceId',isAuthenticatedUser,homeController.print)
router.use('/user',require('./user'))
router.use('/admin',require('./admin'))
// router.use('/superadmin',require('./superadmin'))



module.exports = router; 