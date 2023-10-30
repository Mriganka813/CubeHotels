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
    return res.render('adminlogin',{
        title:'LOGIN'
    })
}

module.exports.loginAdmin=async function(req,res){
    try {
        const { email, password } = req.body;
    
        // Find the user by email
        const admin = await Admin.findOne({ email });
        console.log(admin);
    
        if (!admin) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Check if the password is correct (handled in the User schema)
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // Generate JWT token
        const token = jwt.sign({ userId: admin._id,admin }, process.env.SECRET_KEY);
        
        // Set the token in a cookie
        res.cookie('token', token, { httpOnly: true });
    
       res.render('superadmin',{
        title:'Dashboard'
       });
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