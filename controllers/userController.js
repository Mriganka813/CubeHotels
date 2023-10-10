const User = require('../models/user')
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const secretKey ="mysecretKey"
const bcrypt = require('bcrypt');
const RoomTypes = require('../models/roomType')
const fs = require('fs');



module.exports.signup=async function(req,res){
    try {
        const { name, hotelName, email, password, number, address,gst } = req.body;
        
        // Check if email or number is already taken
        const existingUser = await User.findOne({ $or: [{ email }, { number }] });
        if (existingUser) {
          return res.status(400).json({ error: 'Email or number is already taken.' });
        }
    
        // Upload image to Cloudinary
        // const result = await cloudinary.uploader.upload(image);
        // console.log(result);

        const imageFile = req.file;
        const result = await cloudinary.uploader.upload(imageFile.path);
        console.log(result.secure_url);
        fs.unlinkSync(imageFile.path);
        const user = new User({
          name,
          hotelName,
          email,
          password, // Password is plain text here
          number,
          address,
          gst,
          image: result.secure_url, // Use the secure URL from Cloudinary
        });
    
        // // Save the user to the database
        await user.save();
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, secretKey);
    
        // // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
    
        // res.status(201).json({ message: 'Signup successful' });
        res.redirect('/user/login-page')
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
  

module.exports.login=async function(req,res){
    try {
        const { email, password } = req.body;
    
        // Find the user by email
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Check if the password is correct (handled in the User schema)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: user._id,user }, secretKey);
    
        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
    
       res.redirect('/');
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

module.exports.addCategory=async(req,res)=>{
    try{
        const userId = req.user.userId
        console.log(userId);
        const {roomType} = req.body
        const newRoom = new RoomTypes({
            roomType,
            owner:userId
        })

        await newRoom.save()
        res.redirect('back')
    }catch(err){
        res.send(err)
    }
}

// Assuming you are using Express.js
module.exports.signout = function (req, res) {
  // Clear the token cookie by setting it to an empty value and expiring it immediately
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  
  // Redirect the user to a login or home page, or you can send a JSON response
  res.redirect('/user/login-page'); // Example redirect route
};
