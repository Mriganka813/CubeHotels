const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/superadmin')


module.exports.createAdmin=async(req,res)=>{
    const { name,email,password,number }=req.body
    const checkAdmin = await Admin.findOne({email,number})
    if(checkAdmin){
        return res.send('Already Exist')
    }
    const newAdmin =  new Admin({
        ...req.body
    })

     await newAdmin.save()
    
    const token = jwt.sign({ userId: newAdmin._id }, process.env.SECRET_KEY);
    
    // // Set the token in a cookie
    res.cookie('token', token, { httpOnly: true });
    return res.send(newAdmin)
}

module.exports.renderLogin=async(req,res)=>{
    return res.render('admin/adminlogin',{
        title:'LOGIN'
    })
}

module.exports.loginAdmin = async function (req, res) {
    try {
      const { email, password } = req.body;
  
      // Find the admin by email
      const admin = await Admin.findOne({ email });
      console.log(admin);
  
      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Check if the password is correct using bcrypt
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      // Check if the user is an admin
      if (!admin.isAdmin) {
        return res.status(401).json({ error: 'Not an admin' });
      }
  
      // Generate JWT token for the admin
      const token = jwt.sign({ userId: admin._id, isAdmin: true }, process.env.SECRET_KEY);
  
      // Set the token in a cookie
      res.cookie('token', token, { httpOnly: true });
      res.locals.user = admin;
  
      // Redirect to the admin dashboard (you can change the URL accordingly)
      res.redirect('/admin/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

module.exports.dashboard=async(req,res)=>{

    return res.render('admin/superadmin',{
        title:'SUPER ADMIN'
    })
}