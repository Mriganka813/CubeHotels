const mongoose =require('mongoose');
const bcrypt = require('bcrypt');


const superAdminSchema = mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    email:{
        type:String,
        require: true
    },
    password:{
        type:String,
        require: true
    },
    number:{
        type: Number,
        require: true
    },
    verifyed:{
        type:Boolean,
        default:false
    }
},
    {
        timestamps: true
    
});

superAdminSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
})

const Admin=mongoose.model('Admin',superAdminSchema);
module.exports=Admin;