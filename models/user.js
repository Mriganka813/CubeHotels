const mongoose =require('mongoose');
const bcrypt = require('bcrypt');


const userSchema = mongoose.Schema({
    name:{
        type:String,
        require: true
    },
    gst:{
        type:String
    },
    hotelName:{
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
    address: {
        type:String,
        require: true
    },
    image:{
        type:String
    },
    verified:{
        type:Boolean,
        default: false
    },
    advPaymentMode:{
        type: String
    }
    

   },
    {
        timestamps: true
    
});

userSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    }
})

const User=mongoose.model('User',userSchema);
module.exports=User;