const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/superadmin')


module.exports.createAdmin=async(req,res)=>{
    const { name,email,password,number }=req.body
    const newAdmin = await new Admin({
        ...req.body
    })
    
    const token = jwt.sign({ userId: user._id }, secretKey);
    
    // // Set the token in a cookie
    res.cookie('token', token, { httpOnly: true });
    return res.render('adminlogin',{
        title:'Login'
    })
}

module.exports.loginAdmin=async function(req,res){
    try {
        const { email, password } = req.body;
    
        // Find the user by email
        const admin = await Admin.findOne({ email });
    
        if (!admin) {
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

module.exports.dashboard=async(req,res)=>{

    return res.render('superadmin',{
        title:'SUPER ADMIN'
    })
}