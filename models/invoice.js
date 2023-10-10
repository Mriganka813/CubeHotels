const mongoose =require('mongoose');

const invoiceSchema = mongoose.Schema({
    guestName:{
        type:String,
        require: true
    },
    guestId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest',
        require: true
    },
    roomNum:{
        type: String,
        require: true
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms',
        require: true
    },
    invoiceId:{
        type:String,
        require: true // booking ID
    },
    
    checkOut:{
        type:String,
        require: true
    },
    checkIn:{
        type:String,
        require: true
    },
    checkOutTime:{
        type:String,
    },
    checkInTime:{
        type:String,
    },
    advance:{
        type:Number,
        require: true
    },
    discount:{
        type:Number,
        require: true
    },
    serviceCharge:{
        type:Number,
        require: true
    },
    gst:{
        type:Number,
        // require: true
    },
    net:{
        type:Number,
        require: true
    },
    stay:{
        type:Number
    },
    address:{
        type: String,
        require: true
    },
    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
   },
    {
        timestamps: true
    
});

const Invoice=mongoose.model('Invoice',invoiceSchema);
module.exports=Invoice;