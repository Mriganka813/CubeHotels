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
        let imageUrl = "https://cdn-icons-png.flaticon.com/128/1946/1946788.png"
        if(imageFile){
          const result = await cloudinary.uploader.upload(imageFile.path);
          console.log(result.secure_url);
          imageUrl = result.secure_url
          fs.unlinkSync(imageFile.path);
        }
        const user = new User({
          name,
          hotelName,
          email,
          password, // Password is plain text here
          number,
          address,
          gst,
          image: imageUrl, // Use the secure URL from Cloudinary
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

module.exports.addCategoryPage=async(req,res)=>{
  const userId = req.user.userId
  const category = await RoomTypes.find({owner:userId})
  return res.render('addcategory',{
    title:'Category',
    category
})
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


module.exports.deleteType = async(req,res)=>{
  const {id} = req.params
  const type = await RoomTypes.deleteOne({_id:id})

  return res.redirect('back')
}

module.exports.myAccount=async(req,res)=>{
  try{
    const {userId}=req.user
    const user = await User.findById(userId)
    console.log(user);
    if(!user){
      return res.redirect('/')
    }
    return res.render('account',{
      title: user.name,
      user,
    })
  }catch(err){
    console.log(err);
  }
}


module.exports.editAccount=async(req,res)=>{
  const {userId} = req.user
  const user = await User.findById(userId)

  return res.render('editaccount',{
    title: 'User',
    user
  })
}

module.exports.updateAccount=async(req,res)=>{
  const {userId} = req.user
  const {name, hotelName, email, number, address, gst, image}=req.body
  const user = await User.findById(userId)
  const imageFile = req.file;
        let imageUrl = user.image
        if(imageFile){
          const result = await cloudinary.uploader.upload(imageFile.path);
          console.log(result.secure_url);
          imageUrl = result.secure_url
          fs.unlinkSync(imageFile.path);
        }

        try {
          await User.updateOne(
            { _id: userId }, // Find the user by their _id
            {
              $set: {
                name,
                hotelName,
                email,
                number,
                address,
                gst,
                image: imageUrl, // Update the image URL
              },
            }
          );
      
          return res.redirect('back')
        } catch (error) {
          res.status(500).json({ error: 'Error updating user data' });
        }
}