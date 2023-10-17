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
    discount:{
        type:Number,
        require: true
    },
    serviceCharge:{
        type:Number,
        require: true
    },
    checkout:{
        type:String
    },
    checlIn:{
        type:String
    },
    gst:{
        type:Number,
        // require: true
    },
    net:{
        type:Number,
        require: true
    },
    rent:{
        type:Number
    },
    dailyRent:{
        type:Number
    },
    stay:{
        type:Number //No. Of days 
    },
    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    gstAmt:{
        type:Number
    }
   },
    {
        timestamps: true
    
});

const Invoice=mongoose.model('Invoice',invoiceSchema);
module.exports=Invoice;