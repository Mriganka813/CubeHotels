const mongoose =require('mongoose');

const guestSchema = mongoose.Schema({
    guestName:{
        type: String,
        require: true
    },
    business:{
        type:String
    },
    allGuests:{
        type: String,
        require: true
    },
    numberOfGuest:{
        type: Number,
        require: true
    },
    adults:{
        type: Number,
        require: true
    },
    childern:{
        type: Number,
        require: true
    },
    checkIn:{
        type: String,
        require: true
    },
    checkOut:{
        type: String,
        require: true
    },
    checkOutTime:{
        type:String,
    },
    checkInTime:{
        type:String,
    },
    address:{
        type: String,
        require: true
    },
    phNumber:{
        type: Number,
        require: true
    },
    roomNum:{
        type: String,
        require: true
    },
    advPayment:{
        type: Number,
        require: true
    },
    nationality:{
        type: String,
        default: "Indian"
    },
    orders:{
        type: mongoose.Schema.Types.ObjectId,
        // ref: 'User'
    },
    invoiceId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    },
    status:{
        type: String,
        default: "stay"
    },
    bookingId:{
        type: String
    },
    hotelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rent:{
        type:Number
    },
    stay:{
        type:Number
    },
    gst:{
        type:String
    },
    roomId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rooms'
    },
    businessName:{
        type:String
    },
    guestGst:{
        type:String
    },
    net:{
        type:Number
    },
    advPaymentMode:{
        type: String
    },
    paymentMode:{
        type:String
    }
   },
    {
        timestamps: true
    
});

const Guest=mongoose.model('Guest',guestSchema);
module.exports=Guest;