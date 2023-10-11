const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = require('../config/upload')
const {isAuthenticatedUser}=require('../config/auth')
router.get('/signup-page',async(req,res)=>{
    return res.render('signup',{
        title:'Register'
    })
})

// Set up multer for handling file uploads
const storage = multer.memoryStorage();


router.post('/signup', upload.single('image'), userController.signup);
router.get('/login-page',async(req,res)=>{
    return res.render('login',{
        title:'Login',
        excludeHeader: true 
    })
})

router.get('/add-category',isAuthenticatedUser,userController.addCategoryPage)
router.post('/addroom',isAuthenticatedUser,userController.addCategory)
router.get('/signout', userController.signout);
router.get('/delete/type/:id',isAuthenticatedUser,userController.deleteType)
router.post('/login',userController.login)
module.exports = router; 